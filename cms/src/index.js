'use strict';

const integrations = require('./seed/integrations');
const content = require('./seed/content');
const { importScreenshots } = require('./screenshots');
const { runContentUpdates } = require('./content-updates');

const LOCALES = [
  { code: 'de', name: 'German (de)' },
  { code: 'fr', name: 'French (fr)' },
  { code: 'it', name: 'Italian (it)' },
];

/** Content types the front end reads with its API token (read only). */
const PUBLIC_READ = ['page', 'integration', 'service-plan', 'global', 'github-release'];

/**
 * Admin accounts from environment variables, so a fresh deployment is ready without
 * anyone registering in the browser. Existing accounts are never changed.
 *   DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD   → Super Admin
 *   DEMO_EDITOR_EMAIL / DEMO_EDITOR_PASSWORD → Editor (tests, screenshots)
 */
async function ensureAccounts(strapi) {
  const users = strapi.service('admin::user');
  const roles = strapi.service('admin::role');
  const accounts = [
    { prefix: 'DEMO_ADMIN', role: 'strapi-super-admin', firstname: 'Demo', lastname: 'Admin' },
    { prefix: 'DEMO_EDITOR', role: 'strapi-editor', firstname: 'Demo', lastname: 'Editor' },
  ];
  for (const account of accounts) {
    const email = (process.env[`${account.prefix}_EMAIL`] || '').trim().toLowerCase();
    const password = process.env[`${account.prefix}_PASSWORD`] || '';
    if (!email || !password) continue;
    if (await users.exists({ email })) {
      strapi.log.info(`[setup] ${account.prefix}_EMAIL account already exists, leaving it unchanged`);
      continue;
    }
    // Strapi's rule: 8+ characters with an upper-case letter, a lower-case letter and a number.
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      strapi.log.warn(`[setup] ${account.prefix}_PASSWORD is too weak (8+ characters, upper- and lower-case letter, number); account not created`);
      continue;
    }
    const role = await roles.findOne({ code: account.role });
    if (!role) continue;
    await users.create({
      email, firstname: account.firstname, lastname: account.lastname, password,
      registrationToken: null, isActive: true, roles: [role.id],
    });
    strapi.log.info(`[setup] Created ${account.role} account from ${account.prefix}_EMAIL`);
  }
}

async function ensureLocales(strapi) {
  const locales = strapi.plugin('i18n').service('locales');
  const existing = (await locales.find()).map((l) => l.code);
  for (const locale of LOCALES) {
    if (!existing.includes(locale.code)) {
      await locales.create(locale);
      strapi.log.info(`[setup] Added locale ${locale.code}`);
    }
  }
  return (await locales.find()).map((l) => l.code);
}

/** Strapi doesn't grant locales added later to existing roles: give the Editor role all of them. */
async function grantEditorAllLocales(strapi, codes) {
  const role = await strapi.service('admin::role').findOne({ code: 'strapi-editor' });
  if (!role) return;
  const permissions = await strapi.db.query('admin::permission').findMany({
    where: { role: role.id, action: { $startsWith: 'plugin::content-manager.explorer.' } },
  });
  for (const permission of permissions) {
    const properties = permission.properties || {};
    const current = properties.locales || [];
    if (codes.every((c) => current.includes(c))) continue;
    await strapi.db.query('admin::permission').update({
      where: { id: permission.id },
      data: { properties: { ...properties, locales: [...new Set([...current, ...codes])] } },
    });
  }
}

/**
 * The front end reads content with STRAPI_API_TOKEN. Both services share that one
 * variable: here it becomes the key of a read-only custom token named "web".
 */
async function ensureWebToken(strapi) {
  const key = process.env.STRAPI_API_TOKEN;
  if (!key) {
    strapi.log.warn('[setup] STRAPI_API_TOKEN is not set: the website cannot read content');
    return;
  }
  const tokens = strapi.service('admin::api-token');
  const accessKey = tokens.hash(key);
  const single = (name) => strapi.contentType(`api::${name}.${name}`).kind === 'singleType';
  const permissions = PUBLIC_READ.flatMap((name) =>
    single(name) ? [`api::${name}.${name}.find`] : [`api::${name}.${name}.find`, `api::${name}.${name}.findOne`]
  );
  const existing = await strapi.db.query('admin::api-token').findOne({ where: { name: 'web' } });
  if (!existing) {
    const created = await tokens.create({
      name: 'web', description: 'Read-only token of the website (STRAPI_API_TOKEN)', type: 'custom', lifespan: null, permissions,
    });
    await strapi.db.query('admin::api-token').update({ where: { id: created.id }, data: { accessKey, encryptedKey: null } });
    strapi.log.info('[setup] Created the "web" API token from STRAPI_API_TOKEN');
  } else if (existing.accessKey !== accessKey) {
    await strapi.db.query('admin::api-token').update({ where: { id: existing.id }, data: { accessKey, encryptedKey: null } });
    strapi.log.info('[setup] Updated the "web" API token to the current STRAPI_API_TOKEN');
  }
}

/** English starter content, created only when the site has none yet. */
async function seed(strapi) {
  const docs = (uid) => strapi.documents(uid);

  if ((await docs('api::integration.integration').count({ locale: 'en' })) === 0) {
    for (const data of integrations) {
      await docs('api::integration.integration').create({ locale: 'en', data, status: 'published' });
    }
    strapi.log.info(`[setup] Created ${integrations.length} integrations`);
  }

  let planIds = [];
  if ((await docs('api::service-plan.service-plan').count({ locale: 'en' })) === 0) {
    for (const data of content.plans) {
      const plan = await docs('api::service-plan.service-plan').create({ locale: 'en', data, status: 'published' });
      planIds.push(plan.documentId);
    }
    strapi.log.info('[setup] Created the example service plans');
  }

  if ((await docs('api::page.page').count({ locale: 'en' })) === 0) {
    if (!planIds.length) {
      planIds = (await docs('api::service-plan.service-plan').findMany({ locale: 'en', sort: 'order', fields: ['id'] })).map((p) => p.documentId);
    }
    for (const data of [content.home, content.integrationsPage, content.pricingPage(planIds)]) {
      await docs('api::page.page').create({ locale: 'en', data, status: 'published' });
    }
    strapi.log.info('[setup] Created the home, integrations and pricing pages');
  }

  if (!(await docs('api::global.global').findFirst({ locale: 'en' }))) {
    await docs('api::global.global').create({ locale: 'en', data: content.global, status: 'published' });
    strapi.log.info('[setup] Created the global settings');
  }
}

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    const step = async (name, fn) => {
      try {
        return await fn();
      } catch (error) {
        strapi.log.error(`[setup] ${name} failed: ${error.message}`);
        return undefined;
      }
    };
    await step('Demo accounts', () => ensureAccounts(strapi));
    const codes = await step('Locales', () => ensureLocales(strapi));
    if (codes) await step('Editor locales', () => grantEditorAllLocales(strapi, codes));
    await step('Web API token', () => ensureWebToken(strapi));
    await step('Seed content', () => seed(strapi));
    await step('Content updates', () => runContentUpdates(strapi));

    // Screenshots come from GitHub; don't hold up the start for them.
    importScreenshots(strapi).catch((e) => strapi.log.warn(`[setup] Screenshots: ${e.message}`));

    // First start: fetch the release info right away instead of waiting for the night.
    if ((await strapi.db.query('api::github-release.github-release').count()) === 0) {
      strapi.service('api::github-release.github-release').syncAll().catch((e) => strapi.log.warn(`[github] ${e.message}`));
    }
  },
};
