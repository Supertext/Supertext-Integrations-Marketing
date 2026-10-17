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

/** HubSpot: new integration (published, in development) and the Marketing menu entry. */
async function addHubSpot(strapi) {
  const seed = require('./seed/integrations').find((i) => i.slug === 'hubspot');
  const existing = await strapi.documents(INTEGRATION).findFirst({ locale: 'en', filters: { slug: 'hubspot' }, fields: ['id'] });
  if (!existing && seed) {
    const mailchimp = await strapi.documents(INTEGRATION).findFirst({ locale: 'en', filters: { slug: 'mailchimp' }, fields: ['order'] });
    await strapi.documents(INTEGRATION).create({
      locale: 'en',
      data: { ...seed, order: mailchimp?.order ? mailchimp.order - 5 : seed.order },
      status: 'published',
    });
    strapi.log.info('[setup] Created the HubSpot integration');
  }
  return updateGlobal(strapi, (global) => {
    const navigation = stripIds(global.navigation || []);
    for (const group of navigation) {
      for (const l of group.links || []) {
        if (/category=email$/.test(l.url) && l.label === 'Email marketing') Object.assign(l, { label: 'Marketing', description: 'HubSpot, Mailchimp' });
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
  { id: '2026-10-hubspot', run: (strapi) => addHubSpot(strapi) },
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
