'use strict';

module.exports = ({ strapi }) => ({
  async checkout(ctx) {
    const { plan, interval, locale, platform } = ctx.request.body || {};
    try {
      const url = await strapi.service('api::shop.shop').createCheckout({ plan, interval, locale, platform });
      ctx.body = { url };
    } catch (error) {
      if (!error.status) strapi.log.error(`[shop] Checkout failed: ${error.message}`);
      ctx.status = error.status || 502;
      ctx.body = { error: error.status ? error.message : 'Checkout is not available right now.' };
    }
  },

  async session(ctx) {
    try {
      const summary = await strapi.service('api::shop.shop').sessionSummary(ctx.query.session_id);
      if (!summary) return ctx.notFound();
      ctx.body = summary;
    } catch (error) {
      ctx.status = error.status || 502;
      ctx.body = { error: 'Not available.' };
    }
  },

  async webhook(ctx) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const raw = ctx.request.body?.[Symbol.for('unparsedBody')];
    const signature = ctx.request.headers['stripe-signature'];
    if (!secret || !raw || !signature) return ctx.badRequest('Missing signature');
    const shop = strapi.service('api::shop.shop');
    let event;
    try {
      event = shop.stripe().webhooks.constructEvent(raw, signature, secret);
    } catch (error) {
      strapi.log.warn(`[shop] Webhook signature rejected: ${error.message}`);
      return ctx.badRequest('Invalid signature');
    }
    try {
      await shop.handleEvent(event);
    } catch (error) {
      strapi.log.error(`[shop] Webhook ${event.type} failed: ${error.message}`);
      ctx.status = 500; // Stripe retries
      ctx.body = { received: false };
      return;
    }
    ctx.body = { received: true };
  },
});
