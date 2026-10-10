# Installation and operation

The site runs as two Railway services built from this repository, plus a database on the shared Postgres service.

| Service | Dockerfile | Port | Health check |
| --- | --- | --- | --- |
| `cms` (Strapi 5) | `cms/Dockerfile` | 1337 | `/health` |
| `web` (Next.js) | `web/Dockerfile` | 3000 | `/health` |

Both Dockerfiles use the **repository root** as build context. Railway ignores `railway.json`, so set the Dockerfile path (`RAILWAY_DOCKERFILE_PATH`), health check and restart policy on each service. Deploy in the `ams` region.

## Requirements

- Node.js 22 (in the images)
- PostgreSQL: its own database on the shared Railway Postgres (for example `integrations_site`)
- A Stripe account for the shop
- A Supertext API key for translating the content

## Variables

Generate each secret with `openssl rand -base64 32`. Never commit values; they live only in Railway.

### `cms`

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string of this site's database |
| `URL` | Public URL of the CMS, e.g. `https://cms-integrations.up.railway.app` |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` | Strapi secrets (`APP_KEYS` is a comma-separated list of two or more) |
| `CLIENT_URL` | Public URL of the website. The preview pane and CORS allow only this origin. |
| `PREVIEW_SECRET` | Shared with `web`; turns on the preview pane |
| `STRAPI_API_TOKEN` | Shared with `web`. On every start it becomes the key of the read-only API token "web". |
| `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD` | Super Admin, created on start if it doesn't exist |
| `DEMO_EDITOR_EMAIL`, `DEMO_EDITOR_PASSWORD` | Editor with access to all four languages, created on start if it doesn't exist |
| `SUPERTEXT_API_KEY` | Supertext API key for the Translate panel (see below) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…`, or `sk_test_…` for testing) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the Stripe webhook endpoint (`whsec_…`) |
| `STRIPE_AUTOMATIC_TAX` | `true` to let Stripe Tax add Swiss VAT (Stripe Tax must be set up in Stripe) |
| `GITHUB_TOKEN` | Optional: read-only token for the nightly release sync (raises GitHub's rate limit) |
| `PLUGIN_REF` | Optional build argument: branch or tag of the Supertext Strapi plugin (default `main`) |

Account passwords need 8+ characters with an upper-case letter, a lower-case letter and a number. A weaker password skips that account with a warning; the CMS still starts. Existing accounts are never changed. Once `DEMO_ADMIN_*` is set, Strapi's "create the first administrator" screen no longer appears.

### `web`

| Variable | Purpose |
| --- | --- |
| `STRAPI_URL` | CMS address for server requests, e.g. `http://cms.railway.internal:1337` |
| `STRAPI_PUBLIC_URL` | Public URL of the CMS (images, preview). **Also a build argument**: set it before the first build. |
| `STRAPI_API_TOKEN` | Same value as on `cms` (`${{cms.STRAPI_API_TOKEN}}`) |
| `PREVIEW_SECRET` | Same value as on `cms` (`${{cms.PREVIEW_SECRET}}`) |
| `REVALIDATE_SECRET` | Secret of the Strapi webhook that refreshes the cache |
| `SITE_URL` | Public URL of the website |
| `STRIPE_PORTAL_URL` | Optional: Stripe customer portal login link, shown after checkout |

## First deployment

1. Create the database on the shared Postgres service.
2. Create the `cms` service from this repo, set its variables and deploy. On the first start it creates the accounts, the languages (German, French, Italian), the read token and the starter content: all integrations, example plans, the start, integrations and pricing pages, and the header and footer.
3. Create the `web` service, set its variables (including `STRAPI_PUBLIC_URL` before building) and deploy.
4. Set `CLIENT_URL` on `cms` to the website's URL and redeploy `cms`.
5. In Strapi → *Settings → Webhooks*, add a webhook to `https://<web>/api/revalidate` with the header `Authorization: Bearer <REVALIDATE_SECRET>` and the events *Entry publish*, *unpublish*, *update* and *delete*. Without it, published changes appear within a minute.

## Supertext API key

No Supertext account yet? Create one at [supertext.com](https://www.supertext.com/person/en/account/signin). Generate your API key at [supertext.com → Integrations → API](https://www.supertext.com/en/integrations/api) (requires the Admin role). Set it as `SUPERTEXT_API_KEY` on `cms`. Until then, the edit view shows "Supertext is not configured yet".

The plugin isn't on npm: the Docker build clones [Strapi-Supertext-Translation](https://github.com/Supertext/Strapi-Supertext-Translation), builds it and installs it (`cms/scripts/fetch-plugin.sh`). To pin a version, set the build argument `PLUGIN_REF` to its tag.

## Stripe

1. In Stripe, create one product per plan with a monthly and an annual recurring price in CHF. The annual price is the full year's amount.
2. In Strapi, open the plan under *Service plan* and enter the price IDs (`price_…`) in *stripePriceMonthly* and *stripePriceAnnual*. A plan without a price ID shows "Online checkout for this plan opens soon".
3. Add a webhook endpoint `https://<cms>/api/shop/webhook` with the events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated` and `customer.subscription.deleted`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Optional: activate the customer portal and its login link (Stripe → *Settings → Billing → Customer portal*) and put the link in `STRIPE_PORTAL_URL` on `web`.
5. Optional: set up Stripe Tax for Switzerland and set `STRIPE_AUTOMATIC_TAX=true`.

Test with test keys first: card `4242 4242 4242 4242`, any future date, any CVC.

![Plan cards with monthly and annual prices](images/pricing.png)

## Updating

Pushes to `main` redeploy both services on Railway. Strapi applies content-model changes when it starts. Back up the database before changing or removing fields that hold content.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Website shows errors or empty pages | `STRAPI_API_TOKEN` differs between the services, or `STRAPI_URL` is wrong. The CMS log says `[setup] STRAPI_API_TOKEN is not set` when it is missing. |
| Preview pane stays blank | `CLIENT_URL` (cms), `STRAPI_PUBLIC_URL` (web, at build time) or `PREVIEW_SECRET` don't match. Rebuild `web` after changing `STRAPI_PUBLIC_URL`. On different domains the browser may block the preview cookie; use subdomains of one domain (e.g. `cms.` and `integrations.supertext.com`). |
| "Checkout is not available right now" | `STRIPE_SECRET_KEY` is missing or wrong, or the price ID doesn't exist in that Stripe mode (test vs. live). See the CMS log (`[shop]`). |
| Subscriptions don't appear in Strapi | The Stripe webhook URL or `STRIPE_WEBHOOK_SECRET` is wrong. Stripe → *Webhooks* shows the failed deliveries. |
| No version numbers on the integration pages | The nightly sync couldn't reach GitHub (rate limit). Set `GITHUB_TOKEN`. See the log (`[github]`). |
| "Error loading the plugin supertext" | The plugin isn't in `package.json`: run `npm run plugin` in `cms/`. |
