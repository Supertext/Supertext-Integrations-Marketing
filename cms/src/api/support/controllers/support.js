'use strict';

module.exports = ({ strapi }) => ({
  async submit(ctx) {
    // Only the website may submit (server-side, with the shared read token), so the visitor's
    // address it passes on can be trusted for rate limiting.
    const token = process.env.STRAPI_API_TOKEN;
    if (!token || ctx.request.headers.authorization !== `Bearer ${token}`) return ctx.unauthorized();
    const ip = String(ctx.request.headers['x-visitor-ip'] || ctx.request.ip || '').split(',')[0].trim();
    try {
      ctx.body = await strapi.service('api::support.support').submit(ctx.request.body || {}, { ip });
    } catch (error) {
      if (!error.status) strapi.log.error(`[support] Submit failed: ${error.stack || error.message}`);
      ctx.status = error.status && error.status < 500 ? error.status : 502;
      ctx.body = error.status && error.status < 500 ? { error: error.message, code: error.code } : { error: 'Your request could not be sent right now. Please try again.', code: 'unavailable' };
    }
  },

  async github(ctx) {
    const support = strapi.service('api::support.support');
    const raw = ctx.request.body?.[Symbol.for('unparsedBody')];
    if (!support.verifySignature(raw, ctx.request.headers['x-hub-signature-256'])) {
      strapi.log.warn('[support] GitHub webhook signature rejected');
      return ctx.unauthorized('Invalid signature');
    }
    const event = ctx.request.headers['x-github-event'];
    if (event === 'ping') {
      ctx.body = { ok: true };
      return;
    }
    try {
      const result = await support.handleEvent(event, ctx.request.body || {});
      ctx.body = { result };
    } catch (error) {
      strapi.log.error(`[support] GitHub ${event} failed: ${error.message}`);
      ctx.status = 500; // GitHub shows the failed delivery; it can be redelivered.
      ctx.body = { error: 'failed' };
    }
  },
});
