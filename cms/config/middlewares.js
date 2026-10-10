module.exports = ({ env }) => {
  const clientUrl = env('CLIENT_URL', 'http://localhost:3000').replace(/\/$/, '');
  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            // The preview pane embeds the Next.js site.
            'frame-src': ["'self'", clientUrl],
            'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io'],
          },
        },
      },
    },
    { name: 'strapi::cors', config: { origin: [clientUrl] } },
    'strapi::poweredBy',
    'strapi::query',
    // Stripe signs the raw request body, so keep it for the webhook.
    { name: 'strapi::body', config: { includeUnparsed: true } },
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
