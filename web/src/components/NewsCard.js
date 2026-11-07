import Image from 'next/image';
import Link from 'next/link';
import Mark from './Mark';
import { imageProps } from '@/lib/strapi';

export const newsDate = (iso, locale) =>
  new Intl.DateTimeFormat(`${locale}-CH`, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

/** Integration slugs of an article ("typo3,contao") → { slug, system, logoUrl } from the list. */
export const articleSystems = (article, systems) =>
  (article.systems || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((slug) => systems.find((i) => i.slug === slug))
    .filter(Boolean);

/** One article in the news list: cover image (else a screenshot of its first system, else the logos), date, title, excerpt. */
export default function NewsCard({ article, locale, t, systems = [], featured = false }) {
  const marks = articleSystems(article, systems);
  const cover = imageProps(article.cover) || marks.find((m) => m.screenshot)?.screenshot || null;
  return (
    <Link href={`/${locale}/news/${article.slug}`} className={`tile news-card${featured ? ' featured' : ''}`}>
      <div className={`news-visual cat-${article.category}`} aria-hidden="true">
        {cover ? (
          <>
            <Image src={cover.src} alt="" width={cover.width} height={cover.height} sizes="(max-width: 720px) 100vw, 600px" />
            {marks.length > 1 && (
              <span className="news-marks overlay">
                {marks.slice(0, 6).map((m) => <Mark key={m.slug} name={m.system} logo={m.logoUrl} />)}
              </span>
            )}
          </>
        ) : marks.length ? (
          <span className="news-marks">
            {marks.slice(0, 6).map((m) => <Mark key={m.slug} name={m.system} logo={m.logoUrl} large={marks.length <= 3} />)}
          </span>
        ) : (
          <span className="news-word">{t[`newsCat_${article.category}`]}</span>
        )}
      </div>
      <div className="news-text">
        <p className="news-meta">
          <time dateTime={article.date}>{newsDate(article.date, locale)}</time> · {t[`newsCat_${article.category}`]}
        </p>
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
      </div>
    </Link>
  );
}
