import 'server-only';
import qs from 'qs';
import { draftMode } from 'next/headers';

const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
const PUBLIC_URL = (process.env.STRAPI_PUBLIC_URL || STRAPI_URL).replace(/\/$/, '');

/** Absolute URL of an uploaded file (Strapi returns /uploads/… paths for local uploads). */
export function mediaUrl(media) {
  const url = media?.url;
  if (!url) return null;
  return url.startsWith('http') ? url : `${PUBLIC_URL}${url}`;
}

/** What the client components need of an image: url, size and alt text. */
export function imageProps(media) {
  const src = mediaUrl(media);
  if (!src) return null;
  return { src, width: media.width || 1200, height: media.height || 800, alt: media.alternativeText || '' };
}

/**
 * GET from Strapi's REST API with the site's read-only token.
 * In draft mode (the admin's preview pane) drafts are read and nothing is cached.
 */
export async function strapi(path, query = {}) {
  const { isEnabled: draft } = await draftMode();
  const params = qs.stringify({ ...query, ...(draft && { status: 'draft' }) }, { encodeValuesOnly: true });
  const res = await fetch(`${STRAPI_URL}/api${path}${params ? `?${params}` : ''}`, {
    headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
    ...(draft ? { cache: 'no-store' } : { next: { revalidate: 60, tags: ['strapi'] } }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Strapi ${res.status} for ${path}`);
  return (await res.json()).data;
}

const BLOCK_POPULATE = {
  on: {
    'blocks.hero': { populate: '*' },
    'blocks.plan-cards': { populate: { plans: { populate: ['features', 'platforms'], sort: ['order:asc'] } } },
    'blocks.feature-cards': { populate: { cards: { populate: '*' } } },
    'blocks.use-case': { populate: '*' },
    'blocks.comparison-table': { populate: { columns: { populate: '*' }, rows: true } },
    'blocks.integration-grid': true,
    'blocks.logo-strip': { populate: '*' },
    'blocks.faq': { populate: '*' },
    'blocks.cta-band': { populate: '*' },
    'blocks.rich-text': true,
    'blocks.notice': true,
  },
};

/** One document in the requested language, falling back to English when it isn't translated yet. */
async function localized(path, query, locale) {
  const first = await strapi(path, { ...query, locale });
  const found = Array.isArray(first) ? first[0] : first;
  if (found || locale === 'en') return found || null;
  const fallback = await strapi(path, { ...query, locale: 'en' });
  return (Array.isArray(fallback) ? fallback[0] : fallback) || null;
}

export const getPage = (slug, locale) =>
  localized('/pages', { filters: { slug: { $eq: slug } }, populate: { seo: { populate: '*' }, blocks: BLOCK_POPULATE } }, locale);

export const getIntegration = (slug, locale) =>
  localized('/integrations', { filters: { slug: { $eq: slug } }, populate: { logo: true, screenshot: true, features: true, seo: { populate: '*' }, blocks: BLOCK_POPULATE } }, locale);

export const getGlobal = (locale) =>
  localized('/global', {
    populate: { announcement: { populate: '*' }, navigation: { populate: '*' }, footerColumns: { populate: '*' }, loginLink: true, headerCta: true, defaultSeo: { populate: '*' } },
  }, locale);

/** All integrations (in the language if translated, else English), with their latest GitHub release. */
export async function getIntegrations(locale) {
  const query = { populate: { logo: true, screenshot: true }, sort: ['order:asc', 'system:asc'], pagination: { pageSize: 100 } };
  const [own, english, releases] = await Promise.all([
    locale === 'en' ? null : strapi('/integrations', { ...query, locale }),
    strapi('/integrations', { ...query, locale: 'en' }),
    getReleases(),
  ]);
  const bySlug = new Map((own || []).map((i) => [i.slug, i]));
  return (english || []).map((i) => {
    const item = bySlug.get(i.slug) || i;
    return { ...item, release: releases.get(item.repo) || null };
  });
}

/** Locales in which a page / integration has its own (translated) version, e.g. ['en', 'de']. */
export async function translatedLocales(path, slug) {
  const { LOCALES } = await import('./i18n');
  const found = await Promise.all(
    LOCALES.map(async (locale) => {
      try {
        const list = await strapi(path, { locale, filters: { slug: { $eq: slug } }, fields: ['slug'], pagination: { pageSize: 1 } });
        return list?.length ? locale : null;
      } catch {
        return locale === 'en' ? 'en' : null;
      }
    })
  );
  return found.filter(Boolean);
}

/** Slugs and last changes of everything in one locale, for the sitemap and llms.txt. */
export async function listAll(path, locale, fields = ['slug', 'updatedAt']) {
  return (await strapi(path, { locale, fields, pagination: { pageSize: 100 } }).catch(() => [])) || [];
}

export async function getReleases() {
  try {
    const list = (await strapi('/github-releases', { pagination: { pageSize: 100 } })) || [];
    return new Map(list.filter((r) => r.version).map((r) => [r.repo, r]));
  } catch {
    return new Map(); // release info is a nice-to-have
  }
}
