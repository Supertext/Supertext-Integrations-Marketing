'use strict';

// Full-screen view of each plugin in its system, from the docs folder of its GitHub repo.
// Only whole-window views (the system's own interface with Supertext in it), no cropped
// dialogs. Integrations without an entry show the monogram tile until a full-screen
// capture exists. src/screenshots.js imports these and replaces earlier automatic imports;
// images an editor uploaded are never touched.
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
};
