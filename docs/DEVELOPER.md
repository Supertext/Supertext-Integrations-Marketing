# Developer guide

## Architecture

```
Browser ──► web (Next.js 16, App Router) ──REST + read token──► cms (Strapi 5) ──► Postgres
   │              │  /api/checkout ───────────────► /api/shop/checkout ──► Stripe Checkout
   │              │  /api/preview  (draft mode, from Strapi's preview pane)
   └── Stripe ◄───┘                Stripe webhook ──► /api/shop/webhook ──► Subscription
                                   nightly cron ────► GitHub releases ──► GitHub release
```

- **Content** lives in Strapi with i18n (`en` default, `de`, `fr`, `it`). The website reads it with one read-only custom API token: `find`/`findOne` on Page, Integration, Service plan, Global and GitHub release only. Subscriptions have no content-API routes at all. Nothing is public.
- **Website** pages are rendered on request and cached for 60 s (tag `strapi`); the Strapi webhook to `/api/revalidate` clears the cache on publish. Missing translations fall back to English.
- **Preview**: `cms/config/admin.js` maps each document to its front-end path (`cms/src/preview.js`) and opens `web/api/preview?secret=…&url=…&status=…`. That route turns on Next.js draft mode, so Strapi is queried with `status=draft` and nothing is cached. `PreviewListener` reloads the page when Strapi posts `strapiUpdate` after a save. The site allows framing only by the CMS origin (`frame-ancestors`); Strapi's CSP allows framing only the site (`frame-src`).
- **Shop**: everything that talks to Stripe is in the CMS (`cms/src/api/shop`). The website forwards checkout requests, so the Stripe key lives in one service. The webhook checks Stripe's signature on the raw body (`strapi::body` with `includeUnparsed`) and mirrors subscriptions by their Stripe ID. Stripe stays the source of truth.
- **Release sync** (`cms/src/api/github-release`): every night at 03:17, and on the first start, the newest non-draft release of each integration's `repo` (pre-releases included, since the plugins are 0.x) goes into the GitHub release collection. Editorial content is never touched; the website joins releases to integrations by repo.

## Content model

| Type | Notes |
| --- | --- |
| `api::page.page` | `title`, `slug` (localized, may contain `/`), `seo`, `blocks` (dynamic zone) |
| `api::integration.integration` | Shared across languages: `system`, `slug`, `category`, `stage`, `repo`, `url`, `logo`, `order`. Localized: `integrationType`, `summary`, `description`, `seo`, `blocks`. (`status` is reserved by draft & publish, hence `stage`.) |
| `api::service-plan.service-plan` | Shared: prices, `currency`, flags, Stripe price IDs, `platforms`, `order`. Localized: names, texts, `features`. |
| `api::global.global` | Single type: navigation, header links, footer, default SEO |
| `api::github-release.github-release` | No i18n, no drafts; written by the sync |
| `api::subscription.subscription` | No i18n, no drafts, no API routes; written by the webhook |

Blocks are components in `cms/src/components/blocks/`, shared parts in `cms/src/components/shared/`. To add a block: create its schema, add it to the `blocks` dynamic zone of Page and Integration, add its populate rule in `web/src/lib/strapi.js` (`BLOCK_POPULATE`), its component in `web/src/components/blocks/` and its entry in `web/src/components/Blocks.js`.

Seed content (`cms/src/seed/`) is created only when a type is empty. Integration screenshots are separate: on every start, `cms/src/screenshots.js` brings the automatic screenshots in line with `seed/screenshots.js` (full-screen views only), downloading from the plugin repos (raw.githubusercontent.com). It fills empty ones, replaces automatic imports whose source changed and removes automatic imports no longer listed, then publishes (unless the entry has unpublished edits, which stay for the editor). Automatic imports are recognised by their file name (`<slug>-supertext-<file>`), so images an editor uploaded are never touched. Once everything matches it does nothing.

Other one-time changes to existing content (the seed only fills an empty site) live in `cms/src/content-updates.js`: each runs once and is recorded in the CMS store (`plugin_site-setup` → `contentUpdates`), so editors can change or remove the result afterwards. The SDK announcement, the SDK page (`seed/sdk.js`) and its start-page section, menu and footer links were added this way. The integration list mirrors the plugin list in the plugin conventions; when that list changes, update the Integration entries in the CMS (and the seed for fresh installs).

## Local setup

```sh
# CMS
cd cms
cp .env.example .env              # fill in the secrets; DEMO_* for local accounts
npm run plugin                    # builds the Supertext plugin from GitHub, then npm install
npm run develop                   # http://localhost:1337/admin

# Website
cd ../web
cp .env.example .env.local        # STRAPI_API_TOKEN and PREVIEW_SECRET = same as in cms/.env
npm install
npm run dev                       # http://localhost:3000
```

With `DATABASE_URL` (and `INTEGRATIONS_DB_NAME`), `npm start` first creates the database on that server (`scripts/ensure-db.js`, URL helper in `lib/database-url.js`). Locally (Strapi on `localhost`) the website serves images unoptimised, because Next.js doesn't optimise images from private addresses. Without `DATABASE_URL`, Strapi uses SQLite in `cms/.tmp/` (delete the folder to start over with fresh seed content).

For the shop, use Stripe test keys and forward webhooks with the Stripe CLI: `stripe listen --forward-to localhost:1337/api/shop/webhook`, then put the printed `whsec_…` in `STRIPE_WEBHOOK_SECRET`.

### The Supertext plugin

The plugin isn't on npm. `cms/scripts/fetch-plugin.sh` clones [Strapi-Supertext-Translation](https://github.com/Supertext/Strapi-Supertext-Translation) (`PLUGIN_REF`, default `main`), builds it and packs it to `cms/plugins/supertext.tgz` (git-ignored). `package.json` depends on `file:plugins/supertext.tgz`, so the tarball must exist before `npm install`/`npm ci`. Because the tarball is rebuilt each time, `postinstall` (`scripts/unpin-plugin.js`) removes its hash from `package-lock.json`. `cms/.npmrc` sets `legacy-peer-deps`: the plugin declares `react-intl ^6.8.9` and `@strapi/sdk-plugin` as peers, stricter than what Strapi 5.57 ships. Without the plugin in `node_modules`, `config/plugins.js` leaves it out and the CMS still starts.

## Tests

- `cd web && npm test`: every UI language has the same keys, placeholders and links as English.
- `cd cms && npm test`: seed integrations (unique slugs, valid categories and repos) and preview paths.

## Screenshots

`scripts/docs-screenshots.js` takes the screenshots in `docs/images/` from a local CMS and website with Playwright (see the comment at the top of the script). Regenerate them in the same commit when the UI they show changes.

## Code quality and security checks

- `.github/workflows/ci.yml`: builds the CMS (with the plugin) and the website, runs the tests.
- `.github/workflows/checks.yml`: actionlint and zizmor on every push and PR, dependency review on PRs.
- `.github/workflows/links.yml`: lychee weekly and on docs changes; broken links open the issue "Broken links in the docs".
- All actions are pinned to commit SHAs; checkouts use `persist-credentials: false`; workflows default to `permissions: contents: read`.
- GitHub settings (About box, ruleset "Protect main", Dependabot alerts, private vulnerability reporting, secret scanning, CodeQL) are applied with Remy's `set-github-about` script.

## Dependency updates

Dependabot opens weekly PRs for `cms/`, `web/` and GitHub Actions. Majors held back with an `ignore` rule:

- `react`, `react-dom`, `react-router-dom` in `cms/`: Strapi 5's admin ships React 18 and React Router 6.
- `typescript` and `@types/node` in both: TypeScript 7 is the native compiler; the Node types follow the Node version we run (22).

## Deployment

Railway builds `cms/Dockerfile` and `web/Dockerfile` with the repo root as context (see [INSTALLATION.md](INSTALLATION.md)). There are no releases or version tags: `main` is what runs.

## Known limitations and next steps

- Service plans and prices are placeholders until the offer is final.
- The heading font is Archivo (wide) standing in for ABC Ginto Nord; switch to the official neo design tokens and font files when they're available (`web/src/app/globals.css`).
- Integration logos aren't uploaded yet; the site shows initials.
- The plugin's peer dependency ranges should be relaxed in the plugin repo, so `legacy-peer-deps` can go.
- Preview across two unrelated domains depends on third-party cookies; run both services under one domain.
