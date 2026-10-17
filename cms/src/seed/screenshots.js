'use strict';

// The view of each plugin in its system, from the docs folder of its GitHub repo.
// Full-screen views (the system's own interface with Supertext in it) where the repo has one;
// otherwise, for now, the best screenshot from its guides (marked "until a full-screen
// capture exists"). Integrations without an entry show the monogram tile.
// src/screenshots.js imports these and replaces earlier automatic imports when a path
// changes; images an editor uploaded are never touched.
module.exports = {
  'adobe-experience-manager': 'docs/assets/featured2.png',
  apostrophecms: 'docs/images/translated-page-german.png',
  'craft-cms': 'docs/images/05-index-action.png',
  ghost: 'docs/images/tags.png',
  grav: 'docs/images/translated-editor.png',
  joomla: 'docs/images/articles-translated.png',
  magnolia: 'docs/images/translated-de.png',
  neos: 'docs/images/translated-page.png',
  'orchard-core': 'docs/images/translated-editor.png',
  'payload-cms': 'docs/images/edit-view.png',
  silverstripe: 'docs/images/01-supertext-tab.png',
  strapi: 'docs/images/edit-view.png',
  typo3: 'docs/images/translated-page.png',
  umbraco: 'docs/images/translated-german.png',
  wagtail: 'docs/images/translation-editor.png',
  wordpress: 'docs/images/orders.png',
  // Until a full-screen capture exists: the best screenshot from the plugin's guides.
  contao: 'docs/images/05-site-structure-translated.png',
  directus: 'docs/images/09-supertext-module.png',
  'django-cms': 'docs/images/03-translated.png',
  hubspot: 'docs/images/translate-page.png',
  'akeneo-pim': 'docs/images/04-german-product.png',
  atropim: 'docs/images/product-translated.png',
  pimcore: 'docs/images/document-translation-german.png',
  magento: 'docs/images/translated-product.png',
  prestashop: 'docs/images/translated-product.png',
  wix: 'docs/images/translate-page.png',
  mailchimp: 'docs/images/translate-page.png',
};
