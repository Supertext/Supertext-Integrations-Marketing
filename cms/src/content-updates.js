'use strict';

// One-time changes to existing content (the seed only fills an empty site).
// Each update runs once; the CMS remembers it in its store, so editors can change
// or remove the result afterwards without it coming back.
const { sdkAnnouncement, sdkNavLink, SDK_REPO } = require('./seed/announcements');

const GLOBAL = 'api::global.global';

const stripIds = (value) =>
  Array.isArray(value)
    ? value.map(stripIds)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'id').map(([k, v]) => [k, stripIds(v)]))
      : value;

async function updateGlobal(strapi, change) {
  const draft = await strapi.documents(GLOBAL).findFirst({
    locale: 'en',
    status: 'draft',
    populate: { announcement: { populate: '*' }, navigation: { populate: '*' } },
  });
  if (!draft) return false;
  const published = await strapi.documents(GLOBAL).findFirst({ locale: 'en', status: 'published', fields: ['updatedAt'] });
  const editedSincePublish = !published || new Date(draft.updatedAt) - new Date(published.updatedAt) > 1000;
  const data = change(draft);
  if (!data) return true;
  await strapi.documents(GLOBAL).update({ documentId: draft.documentId, locale: 'en', data });
  // Publish right away unless an editor has unpublished changes waiting.
  if (!editedSincePublish) await strapi.documents(GLOBAL).publish({ documentId: draft.documentId, locale: 'en' });
  return true;
}

const UPDATES = [
  {
    id: '2026-10-sdk-announcement',
    run: (strapi) =>
      updateGlobal(strapi, (global) => {
        const navigation = stripIds(global.navigation || []);
        const resources = navigation.find((g) => /resources/i.test(g.label));
        if (resources && !(resources.links || []).some((l) => l.url === SDK_REPO)) {
          resources.links = [{ ...sdkNavLink }, ...(resources.links || [])];
        }
        return { announcement: global.announcement ? stripIds(global.announcement) : sdkAnnouncement, navigation };
      }),
  },
];

async function runContentUpdates(strapi) {
  const store = strapi.store({ type: 'plugin', name: 'site-setup' });
  const done = (await store.get({ key: 'contentUpdates' })) || [];
  for (const update of UPDATES) {
    if (done.includes(update.id)) continue;
    try {
      if (await update.run(strapi)) {
        done.push(update.id);
        await store.set({ key: 'contentUpdates', value: done });
        strapi.log.info(`[setup] Applied content update ${update.id}`);
      }
    } catch (error) {
      strapi.log.warn(`[setup] Content update ${update.id} failed: ${error.message}`);
    }
  }
}

module.exports = { runContentUpdates };
