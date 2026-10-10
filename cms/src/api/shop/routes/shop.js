'use strict';

// Public shop endpoints (no API token): Stripe Checkout and the Stripe webhook.
module.exports = {
  routes: [
    { method: 'POST', path: '/shop/checkout', handler: 'shop.checkout', config: { auth: false } },
    { method: 'GET', path: '/shop/session', handler: 'shop.session', config: { auth: false } },
    { method: 'POST', path: '/shop/webhook', handler: 'shop.webhook', config: { auth: false } },
  ],
};
