'use strict';

// One-time changes to existing content (the seed only fills an empty site).
// Each update runs once; the CMS remembers it in its store, so editors can change
// or remove the result afterwards without it coming back.
const { sdkAnnouncement, sdkNavLink, SDK_REPO } = require('./seed/announcements');
const { sdkPage, homeSdkBlock, navSdk, footerSdk } = require('./seed/sdk');

const GLOBAL = 'api::global.global';
const PAGE = 'api::page.page';

/** Media objects → ids, so populated content can be written back. */
const mediaToIds = (value) =>
  Array.isArray(value)
    ? value.map(mediaToIds)
    : value && typeof value === 'object'
      ? value.mime && value.url
        ? value.id
        : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mediaToIds(v)]))
      : value;

const INTEGRATION = 'api::integration.integration';

/** Technology, versions, licence, about text, features and description: only fills empty fields. */
async function addIntegrationDetails(strapi) {
  const DETAILS = require('./seed/integration-details.json');
  const items = await strapi.documents(INTEGRATION).findMany({ locale: 'en', status: 'draft', populate: ['features'], limit: 500 });
  let changed = 0;
  for (const item of items) {
    const d = DETAILS[item.slug];
    if (!d) continue;
    const data = {};
    for (const key of ['technology', 'supportedVersions', 'license', 'aboutSystem', 'description']) {
      if (!item[key] && d[key]) data[key] = d[key];
    }
    if (!(item.features || []).length && d.features?.length) data.features = d.features.map((text) => ({ text, included: true }));
    if (!Object.keys(data).length) continue;
    const published = await strapi.documents(INTEGRATION).findOne({ documentId: item.documentId, locale: 'en', status: 'published', fields: ['updatedAt'] });
    const edited = !published || new Date(item.updatedAt) - new Date(published.updatedAt) > 1000;
    await strapi.documents(INTEGRATION).update({ documentId: item.documentId, locale: 'en', data });
    if (!edited) await strapi.documents(INTEGRATION).publish({ documentId: item.documentId, locale: 'en' });
    changed++;
  }
  strapi.log.info(`[setup] Added details to ${changed} integrations`);
  return true;
}

/** HubSpot: new integration in the CMS category, between Grav and Joomla (published, live). */
async function addHubSpot(strapi) {
  const seed = require('./seed/integrations').find((i) => i.slug === 'hubspot');
  const [grav, joomla] = await Promise.all(
    ['grav', 'joomla'].map((slug) => strapi.documents(INTEGRATION).findFirst({ locale: 'en', filters: { slug }, fields: ['order'] }))
  );
  const order = grav?.order && joomla?.order ? Math.round((grav.order + joomla.order) / 2) : seed.order;
  const existing = await strapi.documents(INTEGRATION).findFirst({ locale: 'en', status: 'draft', filters: { slug: 'hubspot' }, fields: ['category', 'stage', 'order'] });
  if (!existing && seed) {
    await strapi.documents(INTEGRATION).create({ locale: 'en', data: { ...seed, order }, status: 'published' });
    strapi.log.info('[setup] Created the HubSpot integration');
  } else if (existing && existing.category !== 'cms') {
    // An earlier version of this update put it under Email marketing.
    await strapi.documents(INTEGRATION).update({ documentId: existing.documentId, locale: 'en', data: { category: 'cms', stage: 'live', order, integrationType: seed.integrationType, summary: seed.summary, description: seed.description } });
    await strapi.documents(INTEGRATION).publish({ documentId: existing.documentId, locale: 'en' });
  }
  return updateGlobal(strapi, (global) => {
    const navigation = stripIds(global.navigation || []);
    for (const group of navigation) {
      for (const l of group.links || []) {
        if (/category=email$/.test(l.url) && l.label === 'Marketing') Object.assign(l, { label: 'Email marketing', description: 'Mailchimp' });
        if (/category=cms$/.test(l.url) && l.description === 'WordPress, TYPO3, Strapi and 17 more') l.description = 'WordPress, TYPO3, Strapi, HubSpot and 17 more';
      }
    }
    return { navigation };
  });
}

const usesSdkLink = (value) => JSON.stringify(value || null).includes('"/en/sdk"');

/** Every block type, populated one level deep (enough for the start page's blocks). */
function blocksPopulate(strapi) {
  const zone = strapi.contentType(PAGE).attributes.blocks.components;
  return { on: Object.fromEntries(zone.map((uid) => [uid, { populate: '*' }])) };
}

async function addSdkPage(strapi) {
  const existing = await strapi.documents(PAGE).findFirst({ locale: 'en', filters: { slug: 'sdk' }, fields: ['id'] });
  if (!existing) {
    await strapi.documents(PAGE).create({ locale: 'en', data: sdkPage, status: 'published' });
    strapi.log.info('[setup] Created the SDK page');
  }

  // Start page: the SDK section right after the integration grid.
  const home = await strapi.documents(PAGE).findFirst({
    locale: 'en',
    status: 'draft',
    filters: { slug: 'home' },
    populate: { blocks: blocksPopulate(strapi) },
  });
  if (home && !usesSdkLink(home.blocks)) {
    const published = await strapi.documents(PAGE).findOne({ documentId: home.documentId, locale: 'en', status: 'published', fields: ['updatedAt'] });
    const edited = !published || new Date(home.updatedAt) - new Date(published.updatedAt) > 1000;
    const blocks = mediaToIds(home.blocks);
    const grid = blocks.findIndex((b) => b.__component === 'blocks.integration-grid');
    blocks.splice(grid >= 0 ? grid + 1 : blocks.length, 0, homeSdkBlock);
    await strapi.documents(PAGE).update({ documentId: home.documentId, locale: 'en', data: { blocks } });
    if (!edited) await strapi.documents(PAGE).publish({ documentId: home.documentId, locale: 'en' });
  }

  // Menu, footer and announcement point to the SDK page.
  return updateGlobal(strapi, (global) => {
    const navigation = stripIds(global.navigation || []);
    if (!navigation.some((g) => g.url === navSdk.url)) {
      const pricing = navigation.findIndex((g) => /\/pricing$/.test(g.url || ''));
      navigation.splice(pricing >= 0 ? pricing + 1 : navigation.length, 0, { ...navSdk });
    }
    for (const group of navigation) {
      for (const l of group.links || []) if (l.url === SDK_REPO) Object.assign(l, { url: sdkNavLink.url });
    }
    const footerColumns = stripIds(global.footerColumns || []);
    const column = footerColumns.find((c) => (c.links || []).some((l) => /\/integrations$/.test(l.url)));
    if (column && !usesSdkLink(column.links)) column.links = [...column.links, { ...footerSdk }];
    const announcement = global.announcement ? stripIds(global.announcement) : null;
    if (announcement?.link?.url === SDK_REPO) announcement.link = { ...announcement.link, url: '/en/sdk', newTab: false };
    return { navigation, footerColumns, ...(announcement && { announcement }) };
  });
}

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
    populate: { announcement: { populate: '*' }, navigation: { populate: '*' }, footerColumns: { populate: '*' } },
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


// SEO pass (October 2026): titles, descriptions and H1s around how people search, with
// Supertext in every title. Only values that are still the seed's are changed.
const SEO_PAGES = {
  home: {
    'seo.metaTitle': ['Supertext integrations', 'AI translation plugins for CMS, PIM and shops | Supertext'],
    'seo.metaDescription': [
      'Supertext AI translation inside the CMS, PIM, shop and design tools you already use.',
      'Supertext AI translation inside TYPO3, WordPress, Shopify, Strapi and 25+ other systems. Swiss quality, free plugins, optional support and localization.',
    ],
    hero: ['Translate where your content lives', 'AI translation where your content lives'],
  },
  integrations: {
    'seo.metaTitle': ['Integrations | Supertext', 'Translation plugins for CMS, PIM and shops | Supertext'],
    'seo.metaDescription': [
      'All Supertext plugins for CMS, PIM, e-commerce, email marketing and design files.',
      'All Supertext translation plugins: TYPO3, WordPress, Drupal, Shopify, Magento, Akeneo, HubSpot and more. Free and open source, translate in your system.',
    ],
    hero: ['All Supertext integrations', 'All Supertext translation plugins'],
  },
  pricing: {
    'seo.metaTitle': ['Plans | Supertext integrations', 'Plugin support and localization plans | Supertext'],
    'seo.metaDescription': [
      'Support and localization subscriptions for the Supertext plugins.',
      'Support and localization subscriptions for the Supertext translation plugins: setup, update checks and answers for your platform. The plugins stay free.',
    ],
    faq: [
      {
        question: 'Which platforms does a subscription cover?',
        answer: 'One subscription covers one platform: choose it at checkout from the Supertext integrations. Running several platforms? [Talk to us](https://www.supertext.com/en/contact) about a plan for all of them.',
      },
      {
        question: 'What happens to the plugin if I cancel?',
        answer: 'It keeps working. The plugins are free and open source; only the support and services of your plan end.',
      },
    ],
  },
  sdk: {
    'seo.metaTitle': ['Supertext SDKs and integration guide', 'Translation API SDKs and integration guide | Supertext'],
  },
};

async function seoPages(strapi) {
  for (const [slug, change] of Object.entries(SEO_PAGES)) {
    const page = await strapi.documents(PAGE).findFirst({
      locale: 'en',
      status: 'draft',
      filters: { slug },
      populate: { seo: { populate: '*' }, blocks: blocksPopulate(strapi) },
    });
    if (!page) continue;
    const published = await strapi.documents(PAGE).findOne({ documentId: page.documentId, locale: 'en', status: 'published', fields: ['updatedAt'] });
    const edited = !published || new Date(page.updatedAt) - new Date(published.updatedAt) > 1000;
    const seo = page.seo ? stripIds(mediaToIds(page.seo)) : {};
    const blocks = stripIds(mediaToIds(page.blocks || []));
    let changed = false;
    for (const field of ['metaTitle', 'metaDescription']) {
      const pair = change[`seo.${field}`];
      if (pair && seo[field] === pair[0]) { seo[field] = pair[1]; changed = true; }
    }
    const hero = blocks.find((b) => b.__component === 'blocks.hero');
    if (change.hero && hero?.title === change.hero[0]) { hero.title = change.hero[1]; changed = true; }
    const faq = blocks.find((b) => b.__component === 'blocks.faq');
    if (change.faq && faq) {
      const known = new Set((faq.items || []).map((i) => i.question));
      const add = change.faq.filter((i) => !known.has(i.question));
      if (add.length) { faq.items = [...(faq.items || []), ...add]; changed = true; }
    }
    if (!changed) continue;
    await strapi.documents(PAGE).update({ documentId: page.documentId, locale: 'en', data: { seo, blocks } });
    if (!edited) await strapi.documents(PAGE).publish({ documentId: page.documentId, locale: 'en' });
  }
  return true;
}

/** Questions for an integration's page, built from its own fields. */
function integrationFaq(item) {
  const s = item.system;
  const design = item.category === 'design';
  const list = (item.features || []).map((f) => f.text.replace(/\.$/, '')).filter(Boolean);
  const items = [];
  const needs = [
    item.supportedVersions && `${item.supportedVersions}.`,
    item.integrationType && `Type of integration: ${item.integrationType.replace(/\.?$/, '.')}`,
    design
      ? 'No Supertext account is needed for the XLIFF export and import itself; send the file to Supertext or any translator or CAT tool.'
      : 'You also need a Supertext account and an API key: generate it at [supertext.com → Integrations → API](https://www.supertext.com/en/integrations/api) (requires the Admin role).',
  ].filter(Boolean);
  items.push({ question: `What do I need to use Supertext with ${s}?`, answer: needs.join(' ') });
  if (list.length) {
    items.push({ question: `What does Supertext translate in ${s}?`, answer: list.map((f) => `- ${f}`).join('\n') });
  }
  items.push(
    design
      ? { question: 'Which languages are supported?', answer: 'Any language: the XLIFF 1.2 files work with every CAT tool and translator, and the import puts the translated text back with its formatting.' }
      : {
          question: 'Which languages are supported?',
          answer: `All Supertext languages, with regional variants such as Swiss German (de-CH), French (fr-CH) and Italian (it-CH) and, where the language has one, formal or informal address. Editors review the result in ${s} before publishing.`,
        }
  );
  items.push({
    question: `Is the ${s} plugin free?`,
    answer: [
      `Yes. The plugin is free and open source${item.license ? ` (${item.license})` : ''}.`,
      design ? '' : 'Translations are done with your Supertext account.',
      'Support and localization services are available as [subscriptions](/en/pricing).',
    ].filter(Boolean).join(' '),
  });
  return { __component: 'blocks.faq', title: `Questions about Supertext for ${s}`, items };
}

async function addIntegrationFaqs(strapi) {
  const zone = strapi.contentType(INTEGRATION).attributes.blocks.components;
  const items = await strapi.documents(INTEGRATION).findMany({
    locale: 'en',
    status: 'draft',
    populate: { features: true, blocks: { on: Object.fromEntries(zone.map((uid) => [uid, { populate: '*' }])) } },
    limit: 500,
  });
  let changed = 0;
  for (const item of items) {
    if ((item.blocks || []).some((b) => b.__component === 'blocks.faq')) continue;
    const published = await strapi.documents(INTEGRATION).findOne({ documentId: item.documentId, locale: 'en', status: 'published', fields: ['updatedAt'] });
    const edited = !published || new Date(item.updatedAt) - new Date(published.updatedAt) > 1000;
    const blocks = [...stripIds(mediaToIds(item.blocks || [])), integrationFaq(item)];
    await strapi.documents(INTEGRATION).update({ documentId: item.documentId, locale: 'en', data: { blocks } });
    if (!edited) await strapi.documents(INTEGRATION).publish({ documentId: item.documentId, locale: 'en' });
    changed++;
  }
  strapi.log.info(`[setup] Added questions to ${changed} integrations`);
  return true;
}

const UPDATES = [
  {
    id: '2026-10-sdk-announcement',
    run: (strapi) =>
      updateGlobal(strapi, (global) => {
        const navigation = stripIds(global.navigation || []);
        const resources = navigation.find((g) => /resources/i.test(g.label));
        if (resources && !(resources.links || []).some((l) => l.url === SDK_REPO || l.url === sdkNavLink.url)) {
          resources.links = [{ ...sdkNavLink }, ...(resources.links || [])];
        }
        return { announcement: global.announcement ? stripIds(global.announcement) : sdkAnnouncement, navigation };
      }),
  },
  { id: '2026-10-sdk-page', run: (strapi) => addSdkPage(strapi) },
  { id: '2026-10-integration-details', run: (strapi) => addIntegrationDetails(strapi) },
  { id: '2026-10-hubspot-cms', run: (strapi) => addHubSpot(strapi) },
  { id: '2026-10-seo-pages', run: (strapi) => seoPages(strapi) },
  { id: '2026-10-integration-faq', run: (strapi) => addIntegrationFaqs(strapi) },
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

module.exports = { runContentUpdates, integrationFaq };
