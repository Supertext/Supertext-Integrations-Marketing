import Link from 'next/link';
import { notFound } from 'next/navigation';
import Blocks from '@/components/Blocks';
import Markdown from '@/components/Markdown';
import Mark from '@/components/Mark';
import IntegrationCard from '@/components/IntegrationCard';
import { getIntegration, getIntegrations, mediaUrl } from '@/lib/strapi';
import { ACCOUNT_URL, API_KEY_URL, format, isLocale, strings } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const item = await getIntegration(slug, locale).catch(() => null);
  if (!item) return {};
  return {
    title: item.seo?.metaTitle || `${item.system}`,
    description: item.seo?.metaDescription || item.summary,
    alternates: { canonical: `/${locale}/integrations/${slug}` },
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
    .map((i) => ({ ...i, logoUrl: mediaUrl(i.logo) }));
  const docs = item.repo ? `https://github.com/${item.repo}/blob/main/docs` : null;

  return (
    <>
      <section className="hero">
        <div className="container">
          <p style={{ marginBottom: 24 }}>
            <Link href={`/${locale}/integrations`} className="btn btn-text">← {t.allIntegrations}</Link>
          </p>
          <div className="integration-hero">
            <Mark name={item.system} logo={mediaUrl(item.logo)} large />
            <div style={{ display: 'grid', gap: 16 }}>
              <h1 className="display">{item.system}</h1>
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
            {item.description && <div className="card"><Markdown locale={locale}>{item.description}</Markdown></div>}
            <div className="notice highlight" style={{ margin: 0, maxWidth: 'none' }}>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>{t.gettingStarted}</h2>
              <Markdown locale={locale}>{format(t, 'gettingStartedText', { account: ACCOUNT_URL, apiKey: API_KEY_URL })}</Markdown>
            </div>
          </div>
          <aside className="facts">
            <div className="card">
              <dl>
                {item.integrationType && (<div><dt>{t.typeOfIntegration}</dt><dd>{item.integrationType}</dd></div>)}
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
            <div className="section-head"><h2 className="section-title">{t[`category_${item.category}`]}</h2></div>
            <div className="integrations">
              {related.map((r) => <IntegrationCard key={r.slug} item={r} locale={locale} t={t} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
