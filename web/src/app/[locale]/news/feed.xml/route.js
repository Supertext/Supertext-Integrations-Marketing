import { getArticles } from '@/lib/strapi';
import { isLocale, strings } from '@/lib/i18n';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const escape = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** RSS 2.0 feed of the news in one language. */
export async function GET(request, { params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response('Not found', { status: 404 });
  const t = strings(locale);
  const articles = await getArticles(locale, 50).catch(() => []);
  const link = `${SITE_URL}/${locale}/news`;
  const items = articles
    .map((a) => {
      const url = `${link}/${a.slug}`;
      return [
        '<item>',
        `<title>${escape(a.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${new Date(a.date).toUTCString()}</pubDate>`,
        `<category>${escape(t[`newsCat_${a.category}`])}</category>`,
        `<description>${escape(a.excerpt)}</description>`,
        '</item>',
      ].join('');
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escape(`Supertext ${t.newsTitle}`)}</title>
<link>${link}</link>
<atom:link href="${link}/feed.xml" rel="self" type="application/rss+xml"/>
<description>${escape(t.newsIntro)}</description>
<language>${locale}</language>
${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
