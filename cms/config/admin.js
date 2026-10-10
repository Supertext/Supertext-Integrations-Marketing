const { previewPath } = require('../src/preview');

module.exports = ({ env }) => {
  const clientUrl = env('CLIENT_URL', 'http://localhost:3000').replace(/\/$/, '');
  const previewSecret = env('PREVIEW_SECRET');

  return {
    auth: { secret: env('ADMIN_JWT_SECRET') },
    apiToken: { salt: env('API_TOKEN_SALT') },
    transfer: { token: { salt: env('TRANSFER_TOKEN_SALT') } },
    secrets: { encryptionKey: env('ENCRYPTION_KEY') },
    flags: { nps: false, promoteEE: false },
    // Side-by-side preview in the Content Manager's edit view (Next.js draft mode).
    preview: {
      enabled: Boolean(previewSecret),
      config: {
        allowedOrigins: [clientUrl],
        async handler(uid, { documentId, locale, status }) {
          const document = await strapi.documents(uid).findOne({ documentId, locale, status });
          const pathname = previewPath(uid, document, locale);
          if (!pathname) return null;
          const params = new URLSearchParams({ url: pathname, secret: previewSecret, status: status || 'draft' });
          return `${clientUrl}/api/preview?${params}`;
        },
      },
    },
  };
};
