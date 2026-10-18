import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Blocks from '@/components/Blocks';
import SectionHead from '@/components/blocks/SectionHead';
import Markdown from '@/components/Markdown';
import Mark from '@/components/Mark';
import IntegrationCard from '@/components/IntegrationCard';
import { Check } from '@/components/Icons';
import { getIntegration, getIntegrations, imageProps, mediaUrl, translatedLocales } from '@/lib/strapi';
import { JsonLd, ORG, SITE_URL, alternates, indexingAllowed, metaDescription, social } from '@/lib/seo';
import { faqJsonLd } from '@/lib/page';
import { localizeVersions } from '@/lib/versions';
import { ACCOUNT_URL, API_KEY_URL, format, isLocale, strings } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const item = await getIntegration(slug, locale).catch(() => null);
  if (!item) return {};
  const t = strings(locale);
  const title = item.seo?.metaTitle || `${format(t, 'integrationTitle', { system: item.system })} | Supertext`;
  const description = item.seo?.metaDescription ? metaDescription([item.seo.metaDescription]) : metaDescription([item.summary, localizeVersions(item.supportedVersions, locale)], t.metaTail);
  const alt = alternates(locale, `/integrations/${slug}`, await translatedLocales('/integrations', slug));
  const image = mediaUrl(item.seo?.ogImage) || mediaUrl(item.screenshot);
  return {
    title: { absolute: title },
    description,
    alternates: alt,
    robots: item.seo?.noIndex || !indexingAllowed() ? { index: false, follow: !item.seo?.noIndex } : undefined,
    ...social({ title, description, path: alt.canonical, locale, image }),
  };
}

const dateFormat = (iso, locale) =>
  new Intl.DateTimeFormat(`${locale}-CH`, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

export default async function IntegrationPage({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [item, all] = await Promise.all([getIntegration(slug, locale), getIntegrations(locale)]);
  if (!item) notFound();
  const t = strings(locale);
  const release = all.find((i) => i.slug === slug)?.release;
  const related = all.filter((i) => i.category === item.category && i.slug !== slug).slice(0, 4)
    .map((i) => ({ ...i, logoUrl: mediaUrl(i.logo), screenshot: imageProps(i.screenshot) }));
  const screenshot = imageProps(item.screenshot);
  const pageUrl = `${SITE_URL}/${locale}/integrations/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${pageUrl}#software`,
        name: format(t, 'integrationName', { system: item.system }),
        description: item.summary,
        url: pageUrl,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Translation plugin',
        inLanguage: locale,
        ...(item.supportedVersions && { softwareRequirements: item.supportedVersions }),
        ...(release?.version && { softwareVersion: release.version }),
        ...(release?.releasedAt && { datePublished: release.releasedAt }),
        ...(item.license && { license: item.license }),
        ...(item.url && { downloadUrl: item.url }),
        ...(screenshot && { screenshot: screenshot.src, image: screenshot.src }),
        ...(item.features?.length && { featureList: item.features.map((f) => f.text) }),
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CHF' },
        publisher: ORG,
        dateModified: item.updatedAt,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Supertext', item: `${SITE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: t.allIntegrations, item: `${SITE_URL}/${locale}/integrations` },
          { '@type': 'ListItem', position: 3, name: item.system, item: pageUrl },
        ],
      },
    ],
  };
  const faq = faqJsonLd(item.blocks);
  const docs = item.repo ? `https://github.com/${item.repo}/blob/main/docs` : null;

  return (
    <>
      <JsonLd data={jsonLd} />
      {faq && <JsonLd data={faq} />}
      <section className="hero">
        <div className="container">
          <p style={{ marginBottom: 24 }}>
            <Link href={`/${locale}/integrations`} className="btn btn-text">← {t.allIntegrations}</Link>
          </p>
          <div className="integration-hero">
            <Mark name={item.system} logo={mediaUrl(item.logo)} large />
            <div style={{ display: 'grid', gap: 16 }}>
              <h1 className="display">
                <span className="h1-kicker">{t.integrationHeading}</span> {item.system}
              </h1>
              <p className="hero-sub">{item.summary}</p>
              <div className="integration-meta">
                <span className="tag">{t[`category_${item.category}`]}</span>
                {item.stage === 'in_development' && <span className="tag dev">{t.inDevelopment}</span>}
                {release?.version && <a className="tag version" href={release.url} target="_blank" rel="noopener">v{release.version}</a>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container detail">
          <div style={{ display: 'grid', gap: 24 }}>
            {screenshot && (
              <figure className="screenshot">
                <Image src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} sizes="(max-width: 960px) 100vw, 860px" priority />
              </figure>
            )}
            {item.description && (
              <section className="card detail-section">
                <h2>{t.howItWorks}</h2>
                <Markdown locale={locale}>{item.description}</Markdown>
              </section>
            )}
            {item.features?.length > 0 && (
              <section className="card detail-section">
                <h2>{format(t, 'whatItDoes', { system: item.system })}</h2>
                <ul className="check-list">
                  {item.features.map((f, i) => (
                    <li key={f.id ?? i}><Check /><span>{f.text}</span></li>
                  ))}
                </ul>
              </section>
            )}
            {item.aboutSystem && (
              <section className="card detail-section">
                <h2>{format(t, 'aboutSystem', { system: item.system })}</h2>
                <Markdown locale={locale}>{item.aboutSystem}</Markdown>
              </section>
            )}
            {item.builtInTranslation && (
              <section className="card detail-section">
                <h2>{t.comparedWithBuiltIn}</h2>
                <Markdown locale={locale}>{item.builtInTranslation}</Markdown>
                <p><Link href={`/${locale}/compare`} className="btn btn-text">{t.compareLink} →</Link></p>
              </section>
            )}
            <div className="notice highlight" style={{ margin: 0, maxWidth: 'none' }}>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>{t.gettingStarted}</h2>
              <Markdown locale={locale}>{format(t, 'gettingStartedText', { account: ACCOUNT_URL, apiKey: API_KEY_URL })}</Markdown>
            </div>
          </div>
          <aside className="facts">
            <div className="card">
              <dl>
                {item.integrationType && (<div><dt>{t.typeOfIntegration}</dt><dd>{item.integrationType}</dd></div>)}
                {item.supportedVersions && (<div><dt>{t.supportedVersions}</dt><dd>{localizeVersions(item.supportedVersions, locale)}</dd></div>)}
                {item.technology && (<div><dt>{t.technology}</dt><dd>{item.technology}</dd></div>)}
                {item.license && (<div><dt>{t.license}</dt><dd>{item.license}</dd></div>)}
                {release?.version && (
                  <div>
                    <dt>{t.latestRelease}</dt>
                    <dd><a href={release.url} target="_blank" rel="noopener">v{release.version}</a>{release.releasedAt && ` · ${dateFormat(release.releasedAt, locale)}`}</dd>
                  </div>
                )}
              </dl>
              <div style={{ display: 'grid', gap: 8, marginTop: 20 }}>
                {item.url && <a className="btn btn-primary btn-block" href={item.url} target="_blank" rel="noopener">{t.viewOnGitHub}</a>}
                {docs && <a className="btn btn-secondary btn-block" href={`${docs}/INSTALLATION.md`} target="_blank" rel="noopener">{t.installationGuide}</a>}
                {docs && <a className="btn btn-secondary btn-block" href={`${docs}/USER_GUIDE.md`} target="_blank" rel="noopener">{t.userGuide}</a>}
              </div>
            </div>
            <div className="card" style={{ background: 'var(--dark-green)', color: 'var(--solid-white)', borderColor: 'var(--dark-green)', display: 'grid', gap: 12 }}>
              <h2 style={{ fontSize: 20 }}>{format(t, 'supportForPlatform', { system: item.system })}</h2>
              <p style={{ color: '#c9d4d3', fontSize: 14 }}>{t.supportForPlatformText}</p>
              <Link className="btn btn-mint" href={`/${locale}/pricing?platform=${item.slug}`}>{t.seePlans}</Link>
            </div>
          </aside>
        </div>
      </section>

      <Blocks blocks={item.blocks} locale={locale} t={t} />

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title={t.moreIntegrations} subtitle={t[`category_${item.category}`]} />
            <div className="integrations">
              {related.map((r) => <IntegrationCard key={r.slug} item={r} locale={locale} t={t} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
