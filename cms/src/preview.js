'use strict';

/** Front-end path of a document, used by the admin's preview pane. Null = no preview. */
function previewPath(uid, document, locale) {
  const lang = locale || 'en';
  if (!document) return null;
  switch (uid) {
    case 'api::page.page':
      return document.slug === 'home' ? `/${lang}` : `/${lang}/${document.slug}`;
    case 'api::integration.integration':
      return `/${lang}/integrations/${document.slug}`;
    case 'api::service-plan.service-plan':
      return `/${lang}/pricing`;
    case 'api::global.global':
      return `/${lang}`;
    default:
      return null;
  }
}

module.exports = { previewPath };
