# Changelog

## Unreleased

- Strapi 5 CMS with reusable blocks (hero, plan cards, feature cards, use case, comparison table, integration grid, logo strip, FAQ, call to action, rich text, notice) for pages and integration pages.
- Preview of drafts next to the editor, with automatic reload on save.
- Content in English, German, French and Italian; translation with the Supertext Strapi plugin into Swiss German, French and Italian (formal).
- All Supertext integrations as content, with their latest GitHub release synced every night and a full-screen view of each plugin in its system (imported from its repo where one exists) on the cards and integration pages.
- Service plans with monthly and annual prices and a Stripe Checkout shop; subscriptions recorded through the Stripe webhook.
- Next.js website in the style of supertext.com: start, integrations, pricing and one page per integration.
- HubSpot integration added (content management systems).
- SEO and GEO: titles, descriptions, canonical and hreflang per translated language, Open Graph and Twitter tags with a default image, JSON-LD (Organization, WebSite, SoftwareApplication, BreadcrumbList, FAQPage), robots.txt, sitemap.xml and llms.txt; indexing only with `ALLOW_INDEXING=true`.
- Integration pages with technology, supported versions, license, "How it works", "What Supertext does" and "About" the system; supported versions on the cards.
- SDK page (`/sdk`) for the Supertext SDKs and integration guide, with an SDK item in the main menu, a start-page section, a footer link and a *Build your own integration* card at the end of the integration grid.
- Announcement bar at the top of every page (Global → announcement), launched with the new Supertext SDKs; SDKs and integration guide in the Resources menu.
- Runs on Railway in its own project (supertext-integrations-site): CMS, website and Postgres in the ams region.
- MIT license for the code; the Supertext brand and site content stay all rights reserved.
- Demo accounts from `DEMO_ADMIN_*` / `DEMO_EDITOR_*` and starter content on first start.
