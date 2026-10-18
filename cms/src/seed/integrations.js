'use strict';

// The Supertext plugin list (claude/plugin-conventions.md → Plugin list), as seed data.
// [system, category, repo or URL, type of integration, what it does, status]
const GH = (repo) => ({ repo: `Supertext/${repo}`, url: `https://github.com/Supertext/${repo}` });

const LIST = [
  ['Adobe Experience Manager', 'cms', GH('supertext-aem-connector'), "Translation connector: two AEM content packages for AEM's Translation Integration Framework.", 'Sends AEM translation projects to Supertext and imports the results'],
  ['ApostropheCMS', 'cms', GH('Apostrophe-Supertext-Translation'), "Apostrophe module (npm): a translation provider for Apostrophe's own Localize… step.", 'Translates pages and pieces as editors localize them, widgets and rich text included'],
  ['Contao', 'cms', GH('Contao-Supertext-Translation'), 'Contao bundle (Composer) that adds a back-end action.', 'Translate with Supertext in the site structure: pages or whole websites into other languages'],
  ['Craft CMS', 'cms', GH('CraftCms-Supertext-Translation'), 'Craft plugin (Composer) with a panel on the entry page.', 'Translates entries into your other sites, Matrix and rich text included'],
  ['Directus', 'cms', GH('Directus-Supertext-Translation'), 'Directus extension bundle (npm): interface, endpoint, Flow operation and module.', 'Translate with Supertext box on the item form, fills the Translations field'],
  ['django CMS', 'cms', GH('djangoCMS-Supertext-Translation'), 'Django app (Python package) that adds a toolbar entry.', 'Translates pages and their plugins from the toolbar'],
  ['Drupal', 'cms', { repo: null, url: 'https://www.drupal.org/project/tmgmt_supertext_ai' }, 'Drupal module: a translator provider for the Translation Management Tool (TMGMT), by MD Systems.', 'Translates TMGMT jobs with Supertext AI'],
  ['Ghost', 'cms', GH('Ghost-Supertext-Translation'), 'Separate connector service (Ghost has no admin plugins): works through internal tags, webhooks and the Admin API.', 'Tag a post #translate-… and a translated draft appears'],
  ['Grav', 'cms', GH('Grav-Supertext-Translation'), 'Grav 2 plugin with an Admin2 panel.', 'Supertext panel in the page editor, Markdown kept intact'],
  ['HubSpot', 'cms', GH('HubSpot-Supertext-Translation'), "Hosted app connected to HubSpot with OAuth, working through HubSpot's multi-language content.", 'Translates website and landing pages, blog posts, marketing emails and knowledge base articles into draft language versions'],
  ['Joomla', 'cms', GH('Joomla-Supertext-Translation'), 'Joomla system plugin (installable package).', 'Translates articles into linked, unpublished language versions'],
  ['Magnolia', 'cms', GH('Magnolia-Supertext-Translation'), 'Magnolia module with a Translate with Supertext action in the Pages app.', "Translates pages, areas and components into the site's other languages"],
  ['Neos', 'cms', GH('Neos-Supertext-Translation'), 'Neos package (Composer) that hooks into the content repository; no new UI.', 'Translates automatically when an editor creates a page in another language'],
  ['Orchard Core', 'cms', GH('OrchardCore-Supertext-Translation'), 'Orchard Core module (.NET) with an admin page and a localization hook.', 'Translates content items into other cultures, on demand or on localization'],
  ['Payload CMS', 'cms', GH('Payload-Supertext-Translation'), 'Payload plugin (npm) added to payload.config.', 'Translate button for localized collections and globals'],
  ['Silverstripe', 'cms', GH('Silverstripe-Supertext-Translation'), 'Silverstripe module (Composer) on top of Fluent.', 'Supertext tab translates pages and Elemental blocks into Fluent locales'],
  ['Strapi', 'cms', GH('Strapi-Supertext-Translation'), 'Strapi 5 plugin (npm) with a Content Manager panel.', 'Translates entries into other locales from the Content Manager'],
  ['TYPO3', 'cms', GH('Typo3-Supertext-Translation'), "TYPO3 extension (Composer) that hooks into TYPO3's own localization; no new UI.", 'Translates pages and content elements as editors localize them'],
  ['Umbraco', 'cms', GH('Umbraco-Supertext-Translation'), 'Umbraco package (NuGet) with a backoffice extension.', 'Translate with Supertext for pages, block lists and grids included'],
  ['Wagtail', 'cms', GH('Wagtail-Supertext-Translation'), 'Python package: a machine translator for wagtail-localize.', "Translates pages and snippets inside wagtail-localize's editor"],
  ['WordPress (Polylang)', 'cms', GH('supertext-wordpress-polylang'), 'WordPress plugin: a machine-translation service for Polylang Pro, plus professional translation orders.', 'AI translation next to DeepL in Polylang, and human translation orders'],
  ['Akeneo PIM', 'pim', GH('Akeneo-Supertext-Translation'), 'Akeneo PIM bundle with a Translate with Supertext action on the product page.', 'Translates products and product models into your other locales'],
  ['AtroPIM', 'pim', GH('AtroPIM-Supertext-Translation'), 'AtroCore module with a button on the product and a mass action in the list.', 'Translates products and other AtroCore records into your other languages'],
  ['Pimcore', 'pim', GH('Pimcore-Supertext-Translation'), 'Pimcore bundle (Composer) with a Translate with Supertext button in Pimcore Studio.', "Translates documents into linked language versions and data objects' localized fields"],
  ['Magento', 'ecommerce', GH('Magento-Supertext-Translation'), 'Magento 2 module (also Mage-OS) with a mass action in the admin lists and a button on the edit pages.', "Translates products, categories, CMS pages and blocks into your store views' languages"],
  ['PrestaShop', 'ecommerce', GH('PrestaShop-Supertext-Translation'), 'PrestaShop module with a bulk action in the back-office lists.', "Translates products, categories and CMS pages into your shop's other languages"],
  ['Shopify', 'ecommerce', GH('Shopify-Supertext-Translation'), 'Shopify app in the Shopify admin.', "Translates products, collections, pages and blog posts into all your shop's languages"],
  ['Wix', 'ecommerce', GH('Wix-Supertext-Translation'), 'Wix app with a dashboard page (hosted service), working through Wix Multilingual.', "Translates Wix Stores products and other Wix Multilingual content into your site's languages", 'in_development'],
  ['Mailchimp', 'email', GH('Mailchimp-Supertext-Translation'), 'Hosted app connected to Mailchimp with OAuth: Supertext folders in Mailchimp and a translate page.', 'Turns a campaign into one draft per language, each sent to the subscribers with that language', 'in_development'],
  ['Adobe InDesign', 'design', GH('Adobe-InDesign-Translation'), 'InDesign scripts (ExtendScript).', 'Exports all text to XLIFF 1.2 for any CAT tool and imports the translations with formatting intact'],
  ['Adobe Illustrator', 'design', GH('Adobe-Illustrator-Translation'), 'Illustrator scripts (ExtendScript).', 'Exports all text to XLIFF 1.2 for any CAT tool and imports the translations with formatting intact'],
  ['CorelDRAW', 'design', GH('CorelDRAW-Supertext-Translation'), 'CorelDRAW VBA macro.', 'Exports all text to XLIFF 1.2 for any CAT tool and imports the translations with formatting intact'],
];

const DETAILS = require('./integration-details.json');
const { builtIn } = require('./comparison');
const FILES = require('./file-exchange.json');

/** Technology, versions, licence, about-the-system text, features and description per integration. */
const details = (slug) => {
  const d = DETAILS[slug];
  if (!d) return {};
  return { ...d, features: d.features.map((text) => ({ text, included: true })) };
};

const slugify = (s) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

module.exports = LIST.map(([system, category, link, integrationType, summary, stage = 'live'], index) => ({
  system,
  slug: slugify(system),
  category,
  stage,
  repo: link.repo,
  url: link.url,
  order: (index + 1) * 10,
  integrationType,
  summary,
  ...details(slugify(system)),
  builtInTranslation: builtIn[slugify(system)],
  ...(FILES[slugify(system)] || {}),
}));
