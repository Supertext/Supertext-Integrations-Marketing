import { LOCALES } from '@/lib/i18n';
import { SITE_URL } from '@/lib/seo';
import { listAll } from '@/lib/strapi';

// Built on request (the CMS isn't reachable during the build); Strapi responses are cached for a minute.
export const dynamic = 'force-dynamic';

/** Every page and integration in each language it's translated into, with hreflang alternates. */
export default async function sitemap() {
  const entries = [];
  for (const [path, base] of [['/pages', ''], ['/integrations', '/integrations']]) {
    const fields = path === '/integrations' ? ['slug', 'updatedAt', 'fileFormats'] : ['slug', 'updatedAt'];
    const perLocale = Object.fromEntries(await Promise.all(LOCALES.map(async (l) => [l, await listAll(path, l, fields)])));
    const slugs = new Set(Object.values(perLocale).flat().map((d) => d.slug));
    for (const slug of slugs) {
      const suffix = path === '/pages' && slug === 'home' ? '' : `${base}/${slug}`;
      const locales = LOCALES.filter((l) => perLocale[l].some((d) => d.slug === slug));
      const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${suffix}`]));
      if (locales.includes('en')) languages['x-default'] = `${SITE_URL}/en${suffix}`;
      for (const l of locales) {
        const doc = perLocale[l].find((d) => d.slug === slug);
        entries.push({
          url: `${SITE_URL}/${l}${suffix}`,
          lastModified: doc?.updatedAt,
          changeFrequency: 'weekly',
          priority: suffix === '' ? 1 : base ? 0.7 : 0.8,
          alternates: { languages },
        });
        // The integration's XLIFF and HTML export page.
        if (base && doc?.fileFormats) {
          const files = Object.fromEntries(Object.entries(languages).map(([k, v]) => [k, `${v}/files`]));
          entries.push({ url: `${SITE_URL}/${l}${suffix}/files`, lastModified: doc.updatedAt, changeFrequency: 'monthly', priority: 0.6, alternates: { languages: files } });
        }
      }
    }
  }
  // The support page is part of the website (not the CMS) and exists in every language.
  const languages = Object.fromEntries([...LOCALES.map((l) => [l, `${SITE_URL}/${l}/support`]), ['x-default', `${SITE_URL}/en/support`]]);
  for (const l of LOCALES) entries.push({ url: `${SITE_URL}/${l}/support`, changeFrequency: 'monthly', priority: 0.5, alternates: { languages } });
  return entries;
}
