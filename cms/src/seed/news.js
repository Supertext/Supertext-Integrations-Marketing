'use strict';

// The first news articles (November 2026): the plugins built so far, grouped by kind of system,
// then the support page, the roadmap and the systems added to it. Dates follow the plugins'
// first GitHub releases (or the day the feature went live). Links to /en/… are localized by the site.

const article = (slug, date, category, systems, title, excerpt, body, seo) => ({
  slug,
  date,
  category,
  systems: systems.join(','),
  title,
  excerpt,
  body: body.trim(),
  seo: { metaTitle: seo?.title || `${title} | Supertext`, metaDescription: seo?.description || excerpt },
});

module.exports = [
  article(
    'design-files-xliff',
    '2026-10-05T09:00:00.000Z',
    'plugins',
    ['adobe-indesign', 'adobe-illustrator', 'coreldraw'],
    'InDesign, Illustrator and CorelDRAW: translate design files with XLIFF',
    'Three free scripts take every text out of your layouts as XLIFF and put the translations back with the formatting intact. One translated copy per language; the original stays untouched.',
    `
Brochures, posters and packaging are designed once and then needed in several languages. Copying texts in and out by hand is slow and error-prone. Our new scripts for Adobe InDesign, Adobe Illustrator and CorelDRAW do it for you.

## How it works

1. **Export:** the script collects every text in the document and writes it to an XLIFF 1.2 file, with notes that give translators context.
2. **Translate:** with Supertext, or with your own agency or CAT tool such as Trados Studio, memoQ or Phrase.
3. **Import:** the script creates one copy of the document per language and puts each translation into the same text frames, formatting included. Your original stays as it is.

## What each script covers

- **[InDesign](/en/integrations/adobe-indesign):** stories and threaded frames, text on paths, parent pages, tables and footnotes; anchored objects and character formatting survive the import, and overset text is checked afterwards.
- **[Illustrator](/en/integrations/adobe-illustrator):** point, area and path text on all artboards; threaded text is exported once per story; overset frames are listed and selected.
- **[CorelDRAW](/en/integrations/coreldraw):** artistic and paragraph text on all pages, including groups, PowerClips and master layers; fonts, sizes, colours and fills are carried over.

The scripts run on Windows and macOS (CorelDRAW on Windows) and are free. The guides on each integration page show the installation step by step.
`,
    { title: 'Translate InDesign, Illustrator and CorelDRAW files with XLIFF | Supertext' }
  ),

  article(
    'typo3-contao-neos',
    '2026-10-07T08:00:00.000Z',
    'plugins',
    ['typo3', 'contao', 'neos'],
    'Supertext for TYPO3, Contao and Neos',
    'Three CMS that many Swiss and German websites run on now translate with Supertext AI: TYPO3 and Neos in their own localization step, Contao from the site structure.',
    `
TYPO3, Contao and Neos power a large share of company and public-sector websites in Switzerland, Germany and Austria. All three now have a free Supertext plugin, built to fit the way editors already work in each system.

## TYPO3: no new buttons

The [TYPO3 extension](/en/integrations/typo3) hooks into TYPO3's own localization. When an editor translates a page with the Translate wizard, the List module or the command line, Supertext fills in the texts: page titles, SEO texts, headers, rich text, captions and tables. Each page goes to Supertext as one document per language, so sentences are translated in context, and the page slug is rebuilt from the translated title. For TYPO3 13.4 LTS and 14.3 LTS.

## Contao: a page, a branch or a whole website

The [Contao bundle](/en/integrations/contao) adds *Translate with Supertext* to the site structure. Translate a single page with its articles and content elements, a whole branch, or an entire website into another language. Formatting, links and insert tags stay intact, new pages are created unpublished for review and linked for the language switcher. For Contao 5.7 and 6.0.

## Neos: translates when you create the language version

The [Neos package](/en/integrations/neos) works in the background: when an editor creates a page in another language, it is translated automatically, inline texts with their formatting as well as Inspector fields such as SEO texts. The results land in the editor's workspace, to review before publishing. For Neos 9.

All three plugins are open source. You need a Supertext account and an API key; the installation guides are on the integration pages.
`
  ),

  article(
    'wordpress-drupal-joomla',
    '2026-10-07T09:00:00.000Z',
    'plugins',
    ['wordpress', 'drupal', 'joomla'],
    'WordPress, Drupal and Joomla: Supertext in the big three',
    'Supertext AI translation inside Polylang Pro for WordPress, as a TMGMT provider for Drupal and as a plugin for Joomla articles.',
    `
WordPress, Drupal and Joomla run millions of websites, many of them multilingual. Supertext now works inside each of them, through the translation tools their users already know.

## WordPress with Polylang Pro

The [WordPress plugin](/en/integrations/wordpress) adds Supertext as a machine translation service in Polylang Pro, next to DeepL. Translate single posts from Polylang's buttons or many at once with the bulk action; Gutenberg, the classic editor, ACF fields, terms and SEO meta are covered by Polylang's pipeline. It also supports YOOtheme Pro layouts and Gravity Forms, and lets you order a professional human translation with a live price quote, right from WordPress.

## Drupal with TMGMT

For Drupal 9 to 12, the [Supertext AI module](/en/integrations/drupal) is a translator provider for the Translation Management Tool (TMGMT). Content is sent from TMGMT's interface and comes back into its usual job and review workflow. The module is maintained by our partner MD Systems and published on drupal.org.

## Joomla

The [Joomla plugin](/en/integrations/joomla) translates articles from the Articles list or the article editor: text with its formatting, links, lists and plugin tags such as {loadmodule}, as well as meta data, image alt texts, captions and custom fields. Translations are saved as linked, unpublished articles for review, with formal or informal address. For Joomla 5.4 and 6.1.
`
  ),

  article(
    'craft-silverstripe-grav',
    '2026-10-07T10:00:00.000Z',
    'plugins',
    ['craft-cms', 'silverstripe', 'grav'],
    'Craft CMS, Silverstripe and Grav now translate with Supertext',
    'Three popular PHP CMS get a Supertext panel right where editors work: on the Craft entry page, in a Silverstripe tab and in the Grav page editor.',
    `
Agencies love Craft CMS, Silverstripe and Grav for their clean editing experience. The new Supertext plugins keep it that way: translation is one panel away, and nothing is overwritten without asking.

## Craft CMS

The [Craft plugin](/en/integrations/craft-cms) translates entries into your other sites, right on the entry page or in bulk from the entry index. Rich text keeps its headings, bold text, links and lists; Matrix content and slugs are translated too. You choose formal or informal address per site. For Craft CMS 5.

## Silverstripe with Fluent

The [Silverstripe module](/en/integrations/silverstripe) adds a Supertext tab to every page and translates it into your other Fluent locales: page name, navigation label, meta description, HTML content and Elemental content blocks. New locales get translated URL segments. For Silverstripe CMS 6 with Fluent 8.

## Grav

The [Grav plugin](/en/integrations/grav) puts a Supertext panel into the Admin2 page editor. It translates content, title, menu label and meta description and keeps Markdown, links, code, Twig and shortcodes intact. New translations are created unpublished for review. For Grav 2.
`
  ),

  article(
    'wagtail-django-umbraco-orchard',
    '2026-10-07T11:00:00.000Z',
    'plugins',
    ['wagtail', 'django-cms', 'umbraco', 'orchard-core'],
    'Python and .NET: Wagtail, django CMS, Umbraco and Orchard Core',
    'Supertext plugins for the leading Python and .NET content management systems, each one built into the system’s own translation workflow.',
    `
Not every website runs on PHP. For teams on Python and .NET, Supertext now plugs into four more systems.

## Wagtail

The [Wagtail package](/en/integrations/wagtail) is a machine translator for wagtail-localize. In its translation editor, *Translate with Supertext* fills in titles, rich text, StreamField blocks, SEO texts and snippets. Whole paragraphs are sent with their markup, so sentences read naturally, and existing translations are never overwritten.

## django CMS

The [django CMS app](/en/integrations/django-cms) adds *Translate with Supertext* to the toolbar. It translates page titles, meta descriptions and the texts of plugins; with djangocms-versioning, new languages start as drafts.

## Umbraco

The [Umbraco package](/en/integrations/umbraco) puts a *Translate with Supertext* button next to *Save and publish*. Page name, text fields, rich text and text inside block lists and block grids are translated, and each language version is saved as a draft for review. For Umbraco 17 LTS and 18.

## Orchard Core

The [Orchard Core module](/en/integrations/orchard-core) translates content items into several cultures at once, from the content list or the editor, and automatically when you create a copy through the Localizations menu. Widgets in Flow, Bag and Widgets List parts are covered, Liquid stays intact. For Orchard Core 3.0 on .NET 10.
`,
    { title: 'Supertext for Wagtail, django CMS, Umbraco and Orchard Core' }
  ),

  article(
    'adobe-experience-manager-magnolia',
    '2026-10-07T16:30:00.000Z',
    'plugins',
    ['adobe-experience-manager', 'magnolia'],
    'Enterprise CMS: Adobe Experience Manager and Magnolia',
    'A translation connector for AEM’s Translation Integration Framework and a Magnolia module with a Translate with Supertext action in the Pages app.',
    `
Large organisations translate a lot, and they want it to happen inside their CMS, with their review steps. Two enterprise systems now connect to Supertext.

## Adobe Experience Manager

The [AEM connector](/en/integrations/adobe-experience-manager) plugs into AEM's Translation Integration Framework as a Translation Cloud Service. Translation projects are sent to Supertext, including orders for professional human translation; you see the scope of a job before it starts, and the translations come back into AEM to accept or reject. AEM language codes, including regional variants like de_ch, are converted for you. For AEM 6.5.

## Magnolia

The [Magnolia module](/en/integrations/magnolia) adds *Translate with Supertext* to the Pages app. It translates pages, areas and components, optionally with all subpages; formatting and links in rich text stay intact, and existing translations are kept unless you choose to overwrite them. A Supertext app in Magnolia holds the API key, the form of address and the language codes. For Magnolia 6.4, Community Edition or DX Core.
`
  ),

  article(
    'akeneo-pimcore-atropim',
    '2026-10-08T12:00:00.000Z',
    'plugins',
    ['akeneo-pim', 'pimcore', 'atropim'],
    'Product information in every language: Akeneo, Pimcore and AtroPIM',
    'Supertext now translates product data where it is maintained: in Akeneo PIM, Pimcore and AtroPIM, with validation and history intact.',
    `
Product texts are written once in the PIM and then needed in every market's language, in every channel. The new Supertext plugins translate them at the source.

## Akeneo PIM

The [Akeneo bundle](/en/integrations/akeneo-pim) adds *Translate with Supertext* to the product page's menu. It translates products, product models and variants: localizable text and text area attributes, rich text included, per channel into that channel's locales. Everything is saved through Akeneo's validation and history; existing translations are kept. For Akeneo PIM Community Edition 2026.4.

## Pimcore

In Pimcore Studio, the [Pimcore bundle](/en/integrations/pimcore) translates documents into unpublished, linked pages in each language's document tree, and fills the localized fields of data objects as a new, unpublished version. HTML formatting is kept. For Pimcore 2026.1 or later.

## AtroPIM

The [AtroPIM module](/en/integrations/atropim) translates products and other AtroCore records, with a button on the record and a mass action in the list that can run in the background. Multilingual text, Markdown and rich text fields and attribute values are covered; the API key is stored in an encrypted AtroCore connection.
`,
    { title: 'Translate product data in Akeneo, Pimcore and AtroPIM | Supertext' }
  ),

  article(
    'magento-prestashop-shopify',
    '2026-10-08T21:00:00.000Z',
    'plugins',
    ['magento', 'prestashop', 'shopify', 'wix'],
    'Online shops: Magento, PrestaShop and Shopify',
    'Product names, descriptions, categories and SEO texts translated into all your shop languages, with friendly URLs that follow. Wix is next.',
    `
A shop that speaks its customers' language sells more. Supertext now translates the catalogue of three major shop systems, and a fourth is on its way.

## Magento and Adobe Commerce

The [Magento module](/en/integrations/magento) adds a *Translate with Supertext* mass action to the product, CMS page and block lists, and a button on the edit pages. It translates names, descriptions, SEO fields and page and block content into your store views' languages, keeps Page Builder layouts and Magento directives intact, and updates URL keys with redirects from the old URL. For Magento Open Source and Adobe Commerce 2.4.7 to 2.4.9 and Mage-OS.

## PrestaShop

The [PrestaShop module](/en/integrations/prestashop) brings a bulk action to the products, categories and pages lists. Product names, summaries, descriptions, SEO fields and delivery texts, category texts and CMS pages are translated; friendly URLs follow the translated name. For PrestaShop 8.1, 8.2 and 9.

## Shopify

The [Shopify app](/en/integrations/shopify) translates products, collections, pages, blog posts and blogs into all of your shop's languages at once, in the background. Translations are saved to Shopify's own translation store, ready to review in Translate & Adapt, and outdated ones are refreshed. Works with any Shopify plan.

## Coming next: Wix

An app for [Wix](/en/integrations/wix) is in development. It translates Wix Stores products and categories, Wix Blog posts and other Wix Multilingual content from a page in the Wix dashboard.
`,
    { title: 'Translate Magento, PrestaShop and Shopify shops | Supertext' }
  ),

  article(
    'strapi-payload-directus-ghost-apostrophe',
    '2026-10-09T12:00:00.000Z',
    'plugins',
    ['strapi', 'payload-cms', 'directus', 'ghost', 'apostrophecms'],
    'Headless and JavaScript CMS: Strapi, Payload, Directus, Ghost and ApostropheCMS',
    'Five Node.js-based systems get Supertext translation: panels in Strapi, Payload and Directus, a tag in Ghost and a provider for Apostrophe’s Localize step.',
    `
JavaScript content platforms are the base of many modern websites and apps. Supertext now works in five of them, and this website is translated with one: our CMS runs Strapi with the Supertext plugin.

## Strapi

The [Strapi 5 plugin](/en/integrations/strapi) adds a Supertext panel to the Content Manager. It translates all localized text fields, components and dynamic zones included, keeps formatting and links in Markdown and Blocks fields, copies numbers, dates and media and builds slugs for new translations. Strapi's role permissions per locale are respected.

## Payload CMS

The [Payload plugin](/en/integrations/payload-cms) puts a *Translate* button on localized collections and globals. One click translates into one or several locales, including Lexical rich text and fields inside groups, tabs, arrays and blocks. With drafts enabled, translations are saved as drafts for review.

## Directus

The [Directus extension](/en/integrations/directus) adds a *Translate with Supertext* box to the item form and fills Directus's own Translations field. Nothing is saved until the editor clicks Save; a Flow operation handles bulk and automatic translation.

## Ghost

Ghost has no admin plugins, so the [Ghost connector](/en/integrations/ghost) works with tags: add #translate-de-ch to a post and a translated draft appears, linked to the original, with SEO and social fields, formatting and cards intact.

## ApostropheCMS

The [Apostrophe module](/en/integrations/apostrophecms) adds Supertext to Apostrophe's own *Localize* step. Pages and pieces are translated one at a time or in batches, widgets and rich text included, and new localizations get a translated URL.
`,
    { title: 'Supertext for Strapi, Payload, Directus, Ghost and ApostropheCMS' }
  ),

  article(
    'hubspot-mailchimp',
    '2026-10-16T16:00:00.000Z',
    'plugins',
    ['hubspot', 'mailchimp'],
    'Marketing in every language: HubSpot and Mailchimp',
    'The HubSpot app translates pages, blog posts, emails and knowledge base articles into language variants. The Mailchimp app, in development, turns one campaign into a draft per language.',
    `
Marketing content changes every week, and each change has to reach every language. Two new apps bring Supertext to marketing platforms.

## HubSpot

The [HubSpot app](/en/integrations/hubspot) connects to your portal with OAuth and translates website pages, landing pages, blog posts, marketing emails and knowledge base articles. Pages and posts become language variants in the original's multi-language group, with layout, images, links, forms and personalization tokens intact. It only saves drafts: nothing is published or sent, and the original never changes. We tested it on a real HubSpot account; multi-language content needs Content Hub or Marketing Hub Professional or Enterprise.

## Mailchimp, in development

The [Mailchimp app](/en/integrations/mailchimp) turns a campaign into one translated draft per language, next to the original. Subject line, preview text, content, alt texts and link titles are translated, while layout, images, links and merge tags stay exactly as they are. Each draft is sent only to the subscribers who speak its language. Start from a Supertext folder in Mailchimp or from the app's Translate page.
`,
    { title: 'Translate HubSpot and Mailchimp content | Supertext' }
  ),

  article(
    'translation-mcp',
    '2026-10-10T09:00:00.000Z',
    'plugins',
    ['claude-chatgpt-and-copilot'],
    'Supertext in Claude, ChatGPT and Copilot: the Translation MCP',
    'With the Supertext Translation MCP, AI assistants translate with your terminology and style guide, and a language expert checks the result on request, without leaving the chat.',
    `
Many teams now write in AI assistants. Asked to translate, a general-purpose assistant doesn't know your company's terms, your style guide or how you translated the same sentence last year. The [Supertext Translation MCP](/en/integrations/claude-chatgpt-and-copilot) closes that gap.

## Supertext as a tool of your assistant

MCP, the Model Context Protocol, is an open standard that lets AI assistants use outside tools. Set up Supertext once in Claude, ChatGPT, Microsoft Copilot or LangDock, and ask for a translation in the chat as usual. The assistant hands the text to Supertext, which translates it with your terminology, style guide and earlier translations, and the result comes back into the conversation. Some assistants need a hint such as *Translate using Supertext*; others call Supertext by themselves.

## A language expert on call

When a text matters, write *Please verify*. A Supertext linguist, or one of your own reviewers, checks the translation, and the verified version comes back to the chat with the reviewer named.

## For whole teams

- **Advanced** users connect their own account with OAuth.
- **Enterprise** admins can connect Claude and Copilot for the whole team with an API key.
- Texts are processed on Swiss servers, in line with the GDPR and the Swiss FADP.

The MCP is part of the Supertext Advanced and Enterprise subscriptions. The setup instructions are in the Supertext cockpit under Integrations → MCP; more on [supertext.com/en/mcp](https://www.supertext.com/en/mcp).
`,
    { title: 'Supertext Translation MCP for Claude, ChatGPT and Copilot | Supertext' }
  ),

  article(
    'sdks',
    '2026-10-11T19:00:00.000Z',
    'plugins',
    [],
    'Build your own: Supertext SDKs for five languages',
    'No plugin for your system? The Supertext SDKs for TypeScript, PHP, Python, .NET and Java handle the tricky parts of the API, with an integration guide built from more than 30 plugins.',
    `
Building 30 plugins taught us where integrations get stuck: the upload format, language codes, rate limits, waiting for results. We have put all of it into SDKs, so your own integration doesn't have to learn it again.

## Five languages, one API

The [Supertext SDKs](/en/sdk) for **TypeScript, PHP, Python, .NET and Java** offer the same features, named the way each language expects:

- **Many texts in one go:** keyed texts, plain or HTML, split into documents under the size limit and read back by key.
- **Language codes handled:** source as a bare language (en), target with a region (de-CH), checked before the request.
- **Errors you can show:** one error type with stable codes such as authentication_failure or invalid_language_pair.
- **The fiddly parts built in:** the auth header, retries on rate limits, polling with a timeout and cleaning up afterwards.
- **Testing without a key:** a stand-in API and test vectors for your own tests.

## A guide from 30 plugins

The integration guide next to the SDKs explains what the plugins learned: how to send whole pages for natural sentences, keep formatting and links intact, map a system's languages to Supertext's, and never overwrite an editor's work.

The SDKs and the guide are open source on GitHub. All you need is a Supertext account and an [API key](https://www.supertext.com/en/integrations/api).
`,
    { title: 'Supertext SDKs for TypeScript, PHP, Python, .NET and Java' }
  ),

  article(
    'plugin-updates-november-2026',
    '2026-11-07T11:00:00.000Z',
    'plugins',
    [],
    'What’s new in the plugins: export and import, language choice, connection check',
    'Since launch, the Supertext plugins have learned a lot: XLIFF and HTML export for your own translators, a clear choice of Supertext language, an automatic key check and interfaces in four languages.',
    `
A month after the first releases, the plugins have grown. These are the most important changes; they come with each plugin's next release, and the changelog in each repository lists the details.

## Your own translators: XLIFF and HTML export and import

Almost every plugin can now export content as **XLIFF 1.2 or HTML**, for your agency or a CAT tool such as Trados Studio, memoQ or Phrase, and import the translated file again. Texts changed since the export are skipped unless you choose otherwise, and a summary shows what was imported. Each plugin's [XLIFF and HTML page](/en/integrations) explains how.

## Languages: no more guessing

Each language in your system is now mapped to a **Supertext language from Supertext's own list**, shown by name. Usual cases work without setup (de becomes de-DE, fr becomes fr-FR); for Switzerland, choose de-CH, fr-CH or it-CH once. Formal or informal address is offered only where the language has it.

## Connection check

The plugins check the **API key** by themselves, after saving and when Supertext rejects it, and show the latest result with links to create an account or a key.

## Four interface languages

The plugins' screens and messages, including Supertext's error messages, are now in **English, German, French and Italian**, following the editor's language.

## Under the hood

All plugins now talk to Supertext through the shared [Supertext SDK](/en/sdk). Unless you switch it off, a plugin also tells us its version and whether the connection works, so we can warn you before an update matters. No content, no key and no personal data are sent.
`,
    { title: 'Supertext plugin updates: XLIFF export, language choice and more' }
  ),

  article(
    'support-page',
    '2026-10-18T12:00:00.000Z',
    'website',
    [],
    'Questions, problems, ideas: the new support page',
    'Ask about any Supertext plugin, report a problem or suggest a feature on one page. Answers come by email, in your language, and fixes are tracked in the open.',
    `
Every plugin now has a direct line to us: the [support page](/en/support). Choose the system, say whether you have a question, a problem or an idea, and describe it. That's all.

## What happens next

- **Your request is tracked publicly on GitHub**, in the plugin's repository, without your name and email address, so others with the same question find the answer too. Passwords, API keys and contact details are removed automatically.
- **Questions are answered by email**, in the language you wrote in, usually with a link to the right part of the guide.
- **Problems** are reproduced and fixed. The fix is checked by our developers before it goes into the next release, and you hear from us when it is out.
- **Ideas** go to our product team, who decide what comes next.

You receive a confirmation with a reference number right away, and every answer by email. To add something, simply reply.

## Help us help you

Mention the version of your system and of the plugin, what you did and what you expected. An error message is worth a lot.

[Go to the support page](/en/support)
`,
    { title: 'New support page for all Supertext plugins | Supertext' }
  ),

  article(
    'roadmap',
    '2026-11-07T12:00:00.000Z',
    'roadmap',
    [],
    'Our roadmap is public',
    'See which Supertext plugins are in development, which are planned next and which systems you can request. Every request counts.',
    `
Which plugin comes next? From today you can see it yourself: our [roadmap](/en/roadmap) shows what we are building and what is planned.

## Four statuses

Every integration now has a status, shown on its page:

- **Live:** the plugin is available.
- **In development:** we are building it. Right now that's Wix and Mailchimp.
- **On the roadmap:** planned next, in no fixed order.
- **Not built yet:** no plugin so far, but you can request one.

## Your requests decide

On the roadmap page and on the [support page](/en/support) you can request a plugin for any system, from the list or by typing its name. Requests are counted per system, and the systems with the most requests move up the roadmap. We email you when work on your system starts and again when the plugin is released.

Need a system soon for your company? [Talk to us](https://www.supertext.com/en/contact): we build plugins for customers first.
`,
    { title: 'The Supertext plugin roadmap is public' }
  ),

  article(
    'new-systems-on-the-roadmap',
    '2026-11-07T13:00:00.000Z',
    'roadmap',
    ['contentful', 'sanity', 'sitecore', 'figma', 'atlassian-confluence', 'madcap-flare', 'zendesk', 'github', 'n8n'],
    '54 more systems: which plugin should we build next?',
    'From Contentful and Figma to Zendesk, Jira and Gemini: 54 more systems are now on our list. Nine are on the roadmap, the rest wait for your requests.',
    `
Translation doesn't only happen on websites. Help centres, documentation, design files, code and AI assistants all need it too. So we have added 54 systems to our list, in eight new areas: documentation and office, customer support, project management, developer tools, automation, terminology and CAT tools, reporting and AI assistants.

## Nine on the roadmap

These are planned next, in no fixed order:

- **Content management:** Contentful, Sanity and Sitecore
- **Design:** Figma, with the layout kept
- **Documentation:** Atlassian Confluence and MadCap Flare
- **Customer support:** Zendesk Help Center articles and macros
- **Developer tools:** GitHub, with translated resource files as pull requests
- **Automation:** a Supertext node for n8n

Claude, ChatGPT and Copilot aren't on the list because they already work: the [Supertext Translation MCP](/en/integrations/claude-chatgpt-and-copilot) connects them to Supertext today.

## The rest is up to you

Jira, Notion, Microsoft 365, SharePoint, Intercom, Trados Studio, Gemini and 38 more are open for requests. Find yours on the [roadmap](/en/roadmap), or in the [integrations](/en/integrations) under its category, and request it with one click. Not on the list? [Name it](/en/support?kind=request).
`,
    { title: '54 more systems on the Supertext plugin roadmap' }
  ),
];
