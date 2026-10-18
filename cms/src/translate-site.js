'use strict';

// First translation of the site into German, French and Italian with the Supertext plugin.
// Runs in the background after start-up (translating takes a while and must not hold up the
// health check). Each entry and language is translated once: a published language version
// that wasn't made here (an editor's translation) is never touched; unpublished drafts are replaced. Progress is kept in
// the CMS store, so a restart carries on where it stopped. Turn it off with AUTO_TRANSLATE=false.
//
// The plugin translates every text field, so afterwards the parts that must stay as they are
// get the English value back: slugs, link targets, code blocks and inline code.

const TARGETS = ['de', 'fr', 'it'];
const TYPES = ['api::global.global', 'api::page.page', 'api::integration.integration', 'api::service-plan.service-plan'];
const KEEP = new Set(['slug', 'url']);
const SKIP = new Set(['id', 'documentId', 'locale', 'createdAt', 'updatedAt', 'publishedAt', 'createdBy', 'updatedBy', 'localizations']);

/** Populate everything: components, dynamic zones and media, nested. */
function populateAll(strapi, attributes, depth = 0) {
  const populate = {};
  for (const [name, attribute] of Object.entries(attributes)) {
    if (attribute.type === 'media') populate[name] = true;
    else if (attribute.type === 'component' && depth < 5) {
      const nested = populateAll(strapi, strapi.components[attribute.component].attributes, depth + 1);
      populate[name] = Object.keys(nested).length ? { populate: nested } : true;
    } else if (attribute.type === 'dynamiczone' && depth < 5) {
      populate[name] = {
        on: Object.fromEntries(
          attribute.components.map((uid) => {
            const nested = populateAll(strapi, strapi.components[uid].attributes, depth + 1);
            return [uid, Object.keys(nested).length ? { populate: nested } : true];
          })
        ),
      };
    }
  }
  return populate;
}

/** Puts back the nth match of `pattern` from the source, when both texts have the same number. */
function restoreMatches(source, target, pattern) {
  const original = source.match(pattern) || [];
  if (!original.length || (target.match(pattern) || []).length !== original.length) return target;
  let index = 0;
  return target.replace(pattern, () => original[index++]);
}

/** Code blocks, inline code and link targets come back from the English text. */
function restoreText(source, target) {
  let text = restoreMatches(source, target, /```[\s\S]*?```/g);
  text = restoreMatches(source, text, /`[^`\n]+`/g);
  text = restoreMatches(source, text, /\]\([^)\s]+\)/g);
  return text;
}

/** Walks source and translation side by side and restores what must not change. */
function restore(source, target) {
  if (Array.isArray(source) && Array.isArray(target)) {
    return target.map((item, i) => restore(source[i], item));
  }
  if (source && target && typeof source === 'object' && typeof target === 'object') {
    const out = { ...target };
    for (const [key, value] of Object.entries(target)) {
      if (KEEP.has(key) && typeof source[key] === 'string') out[key] = source[key];
      else if (typeof value === 'string' && typeof source[key] === 'string') out[key] = restoreText(source[key], value);
      else out[key] = restore(source[key], value);
    }
    return out;
  }
  return target;
}

/** Populated content → data the Document Service accepts (no ids, media as ids). */
function toData(value) {
  if (Array.isArray(value)) return value.map(toData);
  if (value && typeof value === 'object') {
    if (value.mime && value.url) return value.id;
    return Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'id').map(([k, v]) => [k, toData(v)]));
  }
  return value;
}

async function translateEntry(strapi, uid, documentId, locale) {
  const model = strapi.contentType(uid);
  const [result] = await strapi.plugin('supertext').service('translator').translate({
    uid,
    documentId,
    sourceLocale: 'en',
    targetLocales: [locale],
  });
  if (result?.status === 'error') {
    const error = new Error(result.error);
    error.code = result.code;
    throw error;
  }
  const populate = populateAll(strapi, model.attributes);
  const documents = strapi.documents(uid);
  const [source, target] = await Promise.all([
    documents.findOne({ documentId, locale: 'en', status: 'draft', populate }),
    documents.findOne({ documentId, locale, status: 'draft', populate }),
  ]);
  const fixed = restore(source, target);
  const data = {};
  for (const [name, attribute] of Object.entries(model.attributes)) {
    if (SKIP.has(name) || attribute.type === 'relation') continue;
    // Shared fields (slug, category …) are the same in every language; Strapi wants them on each save.
    const value = attribute.pluginOptions?.i18n?.localized === false ? source[name] : fixed[name];
    if (value !== undefined) data[name] = toData(value);
  }
  await documents.update({ documentId, locale, data });
  // Publish the language version when the English one is published.
  const published = await documents.findOne({ documentId, locale: 'en', status: 'published', fields: ['id'] });
  if (published) await documents.publish({ documentId, locale });
}

async function translateSite(strapi) {
  if (process.env.AUTO_TRANSLATE === 'false' || !strapi.plugin('supertext')) return;
  if (!strapi.plugin('supertext').service('translator').status().configured) return;
  const store = strapi.store({ type: 'plugin', name: 'site-setup' });
  const state = (await store.get({ key: 'autoTranslations' })) || {};
  const save = () => store.set({ key: 'autoTranslations', value: state });
  let translated = 0;

  for (const uid of TYPES) {
    const entries = await strapi.documents(uid).findMany({ locale: 'en', status: 'draft', fields: ['documentId'], limit: 500 });
    for (const { documentId } of entries) {
      // Language versions that are live already (published) are an editor's translation.
      const live = new Set(
        (await strapi.db.query(uid).findMany({ where: { documentId, publishedAt: { $notNull: true } }, select: ['locale'] })).map(
          (row) => row.locale
        )
      );
      for (const locale of TARGETS) {
        const key = `${uid}:${documentId}:${locale}`;
        if (state[key] === 'done' || state[key] === 'skipped') continue;
        // Published already and not started here: an editor's translation, leave it.
        // (An unpublished draft was never live and is replaced.)
        if (live.has(locale) && state[key] !== 'started') {
          state[key] = 'skipped';
          await save();
          continue;
        }
        state[key] = 'started';
        await save();
        try {
          await translateEntry(strapi, uid, documentId, locale);
          state[key] = 'done';
          await save();
          translated++;
        } catch (error) {
          strapi.log.warn(`[translate] ${uid} ${documentId} → ${locale}: ${error.message}`);
          // Out of credit or no key: stop for now, the next start carries on.
          if (['limitExceeded', 'notConfigured', 'authentication_failure'].includes(error.code)) return;
        }
      }
    }
  }
  if (translated) strapi.log.info(`[translate] Translated ${translated} entries into German, French and Italian`);
}

module.exports = { translateSite, restore, restoreText };
