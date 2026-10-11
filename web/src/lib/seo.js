import { LOCALES } from './i18n';

export const SITE_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/**
 * Search engines and AI crawlers may index the site only when ALLOW_INDEXING=true
 * (set it once the site runs on its real domain with final prices).
 */
export const indexingAllowed = () => process.env.ALLOW_INDEXING === 'true';

export const ORG = {
  '@type': 'Organization',
  '@id': 'https://www.supertext.com/#organization',
  name: 'Supertext',
  legalName: 'Supertext AG',
  url: 'https://www.supertext.com',
  sameAs: [
    'https://www.linkedin.com/company/supertext-ag',
    'https://www.youtube.com/@supertext',
    'https://mastodon.social/@supertext',
    'https://github.com/Supertext',
  ],
};

/**
 * canonical + hreflang for a path that exists in `locales` (translated versions).
 * A locale without its own version shows the English text, so its canonical is the English page.
 * `path` is the part after the locale ('' for the start page, '/pricing', …).
 */
export function alternates(locale, path, locales = LOCALES) {
  const own = locales.includes(locale) ? locale : 'en';
  const languages = Object.fromEntries(locales.map((l) => [l, `/${l}${path}`]));
  if (locales.includes('en')) languages['x-default'] = `/en${path}`;
  return { canonical: `/${own}${path}`, languages };
}

/** Open Graph / Twitter defaults for one page. */
export function social({ title, description, path, locale, image }) {
  // Without an own image: the generated default (app/[locale]/opengraph-image.js).
  const images = [image || `${SITE_URL}/${locale}/opengraph-image`];
  return {
    openGraph: {
      type: 'website',
      siteName: 'Supertext',
      title,
      description,
      url: `${SITE_URL}${path}`,
      locale: { en: 'en_US', de: 'de_CH', fr: 'fr_CH', it: 'it_CH' }[locale] || 'en_US',
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

/** A <script type="application/ld+json"> element. */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
