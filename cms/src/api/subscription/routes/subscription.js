'use strict';

// Subscriptions hold customer data: no public or API-token routes. They're written by
// the Stripe webhook (api::shop) and read in the admin only.
module.exports = { routes: [] };
