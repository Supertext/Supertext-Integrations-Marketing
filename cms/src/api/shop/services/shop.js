'use strict';

const Stripe = require('stripe');

const LOCALES = ['en', 'de', 'fr', 'it'];
let client;

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw Object.assign(new Error('The shop is not configured (STRIPE_SECRET_KEY missing).'), { status: 503 });
  if (!client) client = new Stripe(key);
  return client;
}

/** Unix seconds → ISO, for the period end (on the subscription item in newer Stripe API versions). */
function periodEnd(sub) {
  const seconds = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

module.exports = ({ strapi }) => ({
  stripe,

  async findPlan(slug) {
    return strapi.documents('api::service-plan.service-plan').findFirst({
      locale: 'en',
      status: 'published',
      filters: { slug },
      populate: ['platforms'],
    });
  },

  /** Creates a Stripe Checkout session for a subscription; returns its URL. */
  async createCheckout({ plan: slug, interval, locale, platform }) {
    const lang = LOCALES.includes(locale) ? locale : 'en';
    const plan = typeof slug === 'string' ? await this.findPlan(slug) : null;
    if (!plan || plan.contactOnly) throw Object.assign(new Error('Unknown plan.'), { status: 400 });
    const price = interval === 'year' ? plan.stripePriceAnnual : plan.stripePriceMonthly;
    if (!price) throw Object.assign(new Error('This plan is not available for this billing interval.'), { status: 400 });

    let platformSlug = null;
    if (platform) {
      const allowed = plan.platforms?.length
        ? plan.platforms.map((p) => p.slug)
        : (await strapi.documents('api::integration.integration').findMany({ locale: 'en', status: 'published', fields: ['slug'], limit: 500 })).map((i) => i.slug);
      if (!allowed.includes(platform)) throw Object.assign(new Error('Unknown platform.'), { status: 400 });
      platformSlug = platform;
    }

    const site = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
    const metadata = { planSlug: plan.slug, ...(platformSlug && { platform: platformSlug }) };
    const session = await stripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      locale: lang,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      ...(process.env.STRIPE_AUTOMATIC_TAX === 'true' && { automatic_tax: { enabled: true } }),
      metadata,
      subscription_data: { metadata },
      success_url: `${site}/${lang}/shop/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/${lang}/pricing`,
    });
    return session.url;
  },

  /** What the thank-you page may show: plan and email, nothing else. */
  async sessionSummary(sessionId) {
    if (typeof sessionId !== 'string' || !/^cs_[\w]+$/.test(sessionId)) return null;
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.status !== 'complete') return null;
    return { plan: session.metadata?.planSlug || null, email: session.customer_details?.email || null };
  },

  /** Mirrors a Stripe subscription into the Subscription collection (create or update). */
  async upsertSubscription(sub, extra = {}) {
    const uid = 'api::subscription.subscription';
    const planSlug = sub.metadata?.planSlug || extra.planSlug || null;
    const plan = planSlug ? await this.findPlan(planSlug) : null;
    const data = {
      stripeSubscriptionId: sub.id,
      stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
      status: sub.status,
      interval: sub.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'year' : 'month',
      planSlug,
      platform: sub.metadata?.platform || extra.platform || null,
      currentPeriodEnd: periodEnd(sub),
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      ...(plan && { plan: plan.documentId }),
      ...(extra.email && { email: extra.email }),
      ...(extra.name && { name: extra.name }),
    };
    const existing = await strapi.db.query(uid).findOne({ where: { stripeSubscriptionId: sub.id } });
    if (existing) await strapi.documents(uid).update({ documentId: existing.documentId, data });
    else await strapi.documents(uid).create({ data });
  },

  async handleEvent(event) {
    const object = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed': {
        if (object.mode !== 'subscription' || !object.subscription) return;
        const sub = await stripe().subscriptions.retrieve(object.subscription);
        await this.upsertSubscription(sub, {
          email: object.customer_details?.email,
          name: object.customer_details?.name,
          planSlug: object.metadata?.planSlug,
          platform: object.metadata?.platform,
        });
        return;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.upsertSubscription(object);
        return;
      default:
    }
  },
});
