import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import IntegrationCard from '@/components/IntegrationCard';
import Markdown from '@/components/Markdown';
import NewsCard, { articleSystems, newsDate } from '@/components/NewsCard';
import SectionHead from '@/components/blocks/SectionHead';
import { getArticle, getArticles, getIntegrations, hasPlugin, imageProps, mediaUrl, translatedLocales } from '@/lib/strapi';
import { JsonLd, ORG, SITE_URL, alternates, indexingAllowed, metaDescription, social } from '@/lib/seo';
import { isLocale, strings } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const article = await getArticle(slug, locale).catch(() => null);
  if (!article) return {};
  const seo = article.seo || {};
  const title = seo.metaTitle || article.title;
  const description = metaDescription([seo.metaDescription || article.excerpt]);
  const alt = alternates(locale, `/news/${slug}`, await translatedLocales('/articles', slug));
  const image = mediaUrl(seo.ogImage) || mediaUrl(article.cover);
  const base = social({ title, description, path: alt.canonical, locale, image });
  return {
    title: /supertext/i.test(title) ? { absolute: title } : title,
    description,
    alternates: alt,
    robots: seo.noIndex || !indexingAllowed() ? { index: false, follow: !seo.noIndex } : undefined,
    ...base,
    openGraph: { ...base.openGraph, type: 'article', publishedTime: article.date },
  };
}

export default async function ArticlePage({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [article, articles, integrations] = await Promise.all([
    getArticle(slug, locale),
    getArticles(locale, 20),
    getIntegrations(locale).catch(() => []),
  ]);
  if (!article) notFound();
  const t = strings(locale);
  const all = integrations.map((i) => ({ ...i, logoUrl: mediaUrl(i.logo), screenshot: imageProps(i.screenshot) }));
  const systems = articleSystems(article, all);
  const cards = systems.filter(hasPlugin);
  const more = articles.filter((a) => a.slug !== slug).slice(0, 3);
  const cover = imageProps(article.cover);
  const pageUrl = `${SITE_URL}/${locale}/news/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.excerpt,
        datePublished: article.date,
        dateModified: article.updatedAt || article.date,
        inLanguage: locale,
        mainEntityOfPage: pageUrl,
        ...(cover && { image: [cover.src] }),
        author: { '@type': 'Organization', name: 'Supertext', url: ORG.url },
        publisher: ORG,
        ...(systems.length && { about: systems.map((s) => ({ '@type': 'SoftwareApplication', name: s.system })) }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Supertext', item: `${SITE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: t.newsTitle, item: `${SITE_URL}/${locale}/news` },
          { '@type': 'ListItem', position: 3, name: article.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article>
        <header className="hero article-hero">
          <div className="container article-container">
            <p style={{ marginBottom: 24 }}>
              <Link href={`/${locale}/news`} className="btn btn-text">← {t.newsAll}</Link>
            </p>
            <p className="news-meta">
              <time dateTime={article.date}>{newsDate(article.date, locale)}</time> ·{' '}
              <Link href={`/${locale}/news?category=${article.category}`}>{t[`newsCat_${article.category}`]}</Link>
            </p>
            <h1 className="display article-title">{article.title}</h1>
            <p className="hero-sub">{article.excerpt}</p>
          </div>
        </header>
        <div className="container article-container">
          {cover && <Image className="article-cover" src={cover.src} alt={cover.alt || ''} width={cover.width} height={cover.height} sizes="(max-width: 820px) 100vw, 760px" priority />}
          <Markdown locale={locale} className="prose article-body">{article.body}</Markdown>
        </div>
      </article>

      {cards.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title={t.newsInArticle} />
            <div className="integrations">
              {cards.map((item) => <IntegrationCard key={item.slug} item={item} locale={locale} t={t} />)}
            </div>
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="section" style={cards.length ? { paddingTop: 0 } : undefined}>
          <div className="container">
            <SectionHead title={t.newsMore} />
            <div className="news-grid">
              {more.map((a) => <NewsCard key={a.slug} article={a} locale={locale} t={t} systems={all} />)}
            </div>
            <p className="roadmap-link">
              <Link href={`/${locale}/news`} className="btn btn-text">{t.newsAll} →</Link>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
