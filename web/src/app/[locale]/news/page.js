import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsCard from '@/components/NewsCard';
import { getArticles, getIntegrations, imageProps, mediaUrl } from '@/lib/strapi';
import { isLocale, LOCALES, strings } from '@/lib/i18n';
import { JsonLd, SITE_URL, alternates, indexingAllowed, social } from '@/lib/seo';

const CATEGORIES = ['plugins', 'website', 'roadmap'];

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = strings(locale);
  const alt = alternates(locale, '/news', LOCALES);
  return {
    title: { absolute: t.newsMetaTitle },
    description: t.newsMetaDescription,
    alternates: { ...alt, types: { 'application/rss+xml': `${SITE_URL}/${locale}/news/feed.xml` } },
    robots: indexingAllowed() ? undefined : { index: false, follow: true },
    ...social({ title: t.newsMetaTitle, description: t.newsMetaDescription, path: alt.canonical, locale }),
  };
}

export default async function NewsPage({ params, searchParams }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { category } = await searchParams;
  const t = strings(locale);
  const [articles, integrations] = await Promise.all([getArticles(locale), getIntegrations(locale).catch(() => [])]);
  const systems = integrations.map((i) => ({ slug: i.slug, system: i.system, logoUrl: mediaUrl(i.logo), screenshot: imageProps(i.screenshot) }));
  const chosen = CATEGORIES.includes(category) ? category : null;
  const shown = chosen ? articles.filter((a) => a.category === chosen) : articles;
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, articles.filter((a) => a.category === c).length]));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: t.newsTitle,
    url: `${SITE_URL}/${locale}/news`,
    inLanguage: locale,
    blogPost: articles.slice(0, 20).map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      datePublished: a.date,
      url: `${SITE_URL}/${locale}/news/${a.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="hero">
        <div className="container" style={{ display: 'grid', gap: 16, maxWidth: 760, textAlign: 'center' }}>
          <h1 className="display">{t.newsTitle}</h1>
          <p className="hero-sub">{t.newsIntro}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <nav className="filters" aria-label={t.newsTitle}>
            <Link href={`/${locale}/news`} className="chip" aria-current={chosen ? undefined : 'page'}>
              {t.all}<span className="count">{articles.length}</span>
            </Link>
            {CATEGORIES.filter((c) => counts[c]).map((c) => (
              <Link key={c} href={`/${locale}/news?category=${c}`} className="chip" aria-current={chosen === c ? 'page' : undefined}>
                {t[`newsCat_${c}`]}<span className="count">{counts[c]}</span>
              </Link>
            ))}
          </nav>
          {shown.length ? (
            <div className="news-grid">
              {shown.map((a, i) => (
                <NewsCard key={a.slug} article={a} locale={locale} t={t} systems={systems} featured={i === 0 && !chosen} />
              ))}
            </div>
          ) : (
            <p className="empty">{t.newsEmpty}</p>
          )}
          <p className="roadmap-link">
            <a href={`/${locale}/news/feed.xml`} className="btn btn-text">{t.newsFeed}</a>
          </p>
        </div>
      </section>
    </>
  );
}
