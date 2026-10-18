// Exports every translatable English text of the CMS (string, text and richtext fields; not slugs
// or URLs) to a JSON file: { "English text": "where it is used" }. Translators return the same
// keys with their translation as value, which goes to src/seed/translations/<locale>.json.
// Usage, with the CMS stopped (it opens the same database): AUTO_TRANSLATE=false node scripts/export-strings.js [out.json]
const path = require('path');
const APP = path.join(__dirname, '..');
const OUT = process.argv[2] || 'strings-en.json';
const { createStrapi } = require('@strapi/strapi');
const fs = require('fs');
const TYPES = ['api::global.global', 'api::page.page', 'api::integration.integration', 'api::service-plan.service-plan'];
const KEEP = new Set(['slug', 'url']);
const translatable = (v) => typeof v === 'string' && v.trim() !== '' && !/^[\d\s.,:/+-]+$/.test(v);
(async () => {
  const app = await createStrapi({ appDir: APP, distDir: APP }).load();
  const strings = new Map();
  const add = (text, where) => { if (!strings.has(text)) strings.set(text, where); };
  const populateAll = (attrs, d = 0) => { const p = {}; for (const [n, a] of Object.entries(attrs)) { if (a.type === 'media') p[n] = true; else if (a.type === 'component' && d < 5) { const x = populateAll(app.components[a.component].attributes, d + 1); p[n] = Object.keys(x).length ? { populate: x } : true; } else if (a.type === 'dynamiczone' && d < 5) p[n] = { on: Object.fromEntries(a.components.map((u) => { const x = populateAll(app.components[u].attributes, d + 1); return [u, Object.keys(x).length ? { populate: x } : true]; })) }; } return p; };
  const walk = (attrs, value, where, top) => {
    for (const [name, a] of Object.entries(attrs)) {
      const v = value?.[name]; if (v == null) continue;
      if (top && a.pluginOptions?.i18n?.localized === false) continue;
      if (['string', 'text', 'richtext'].includes(a.type)) { if (!KEEP.has(name) && name !== 'locale' && translatable(v)) add(v, `${where}.${name}`); }
      else if (a.type === 'component') (a.repeatable ? v : [v]).forEach((x, i) => walk(app.components[a.component].attributes, x, `${where}.${name}`, false));
      else if (a.type === 'dynamiczone') v.forEach((x) => walk(app.components[x.__component].attributes, x, `${where}.${x.__component}`, false));
    }
  };
  for (const uid of TYPES) {
    const model = app.contentType(uid);
    const docs = await app.documents(uid).findMany({ locale: 'en', status: 'draft', populate: populateAll(model.attributes), limit: 500 });
    for (const d of docs) walk(model.attributes, d, `${uid.split('.').pop()}:${d.slug || 'global'}`, true);
  }
  fs.writeFileSync(OUT, JSON.stringify(Object.fromEntries(strings), null, 1));
  console.log('strings', strings.size, 'words', [...strings.keys()].join(' ').split(/\s+/).length);
  await app.destroy(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
