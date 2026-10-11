// The Supertext translation plugin is installed from its GitHub repo at build time
// (scripts/fetch-plugin.sh); without it the CMS still runs, just without the Translate panel.
let hasSupertext = false;
try {
  require.resolve('strapi-plugin-supertext-translation/package.json');
  hasSupertext = true;
} catch {
  hasSupertext = false;
}

module.exports = ({ env }) => ({
  'users-permissions': {
    config: { jwtSecret: env('JWT_SECRET') },
  },
  ...(hasSupertext && {
    supertext: {
      enabled: true,
      config: {
        // apiKey and endpoint come from SUPERTEXT_API_KEY / SUPERTEXT_API_ENDPOINT (plugin defaults).
        contentTypes: ['api::page.page', 'api::integration.integration', 'api::service-plan.service-plan', 'api::global.global'],
        // Supertext needs a regional target code (de-CH, not de); the site's locales stay de/fr/it.
        locales: {
          de: { code: 'de-CH', politeness: 'more' },
          fr: { code: 'fr-CH', politeness: 'more' },
          it: { code: 'it-CH', politeness: 'more' },
        },
      },
    },
  }),
});
