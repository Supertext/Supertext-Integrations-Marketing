import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from '@/components/Markdown';
import Mark from '@/components/Mark';
import { getIntegration, mediaUrl, translatedLocales } from '@/lib/strapi';
import { JsonLd, SITE_URL, alternates, indexingAllowed, metaDescription, social } from '@/lib/seo';
import { format, isLocale, strings } from '@/lib/i18n';
import { localizeVersions } from '@/lib/versions';

// /integrations/<slug>/files: translating with your own agency or CAT tool through the plugin's
// XLIFF and HTML export and import. Only for integrations whose fileExport is filled in.

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const item = await getIntegration(slug, locale).catch(() => null);
  if (!item?.fileExport) return {};
  const t = strings(locale);
  const xliffOnly = !/html/i.test(item.fileFormats || '');
  const full = format(t, xliffOnly ? 'filesMetaTitleXliff' : 'filesMetaTitle', { system: item.system });
  // Search results cut titles at about 60 characters; long ones drop the brand suffix instead.
  const title = full.length > 60 ? full.replace(/\s*\|\s*Supertext$/, '') : full;
  const description = metaDescription([item.fileIntro]);
  const alt = alternates(locale, `/integrations/${slug}/files`, await translatedLocales('/integrations', slug));
  return {
    title: { absolute: title },
    description,
    alternates: alt,
    robots: indexingAllowed() ? undefined : { index: false, follow: true },
    ...social({ title, description, path: alt.canonical, locale, image: mediaUrl(item.screenshot) }),
  };
}

export default async function FilesPage({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const item = await getIntegration(slug, locale);
  if (!item?.fileExport) notFound();
  const t = strings(locale);
  const formats = localizeVersions(item.fileFormats, locale);
  const html = /html/i.test(item.fileFormats || '');
  const kicker = html ? t.filesKicker : t.filesKickerXliff;
  const linkLabel = html ? t.filesTeaserLink : t.filesTeaserLinkXliff;
  const guide = item.repo && item.fileDocs ? `https://github.com/${item.repo}/blob/main/${item.fileDocs}` : null;
  const pageUrl = `${SITE_URL}/${locale}/integrations/${slug}/files`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: `${kicker} ${item.system}`,
        description: item.fileIntro,
        step: [
          { '@type': 'HowToStep', name: t.filesStep1, text: item.fileExport },
          { '@type': 'HowToStep', name: t.filesStep2, text: t.filesStep2Text },
          { '@type': 'HowToStep', name: t.filesStep3, text: item.fileImport },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Supertext', item: `${SITE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: t.allIntegrations, item: `${SITE_URL}/${locale}/integrations` },
          { '@type': 'ListItem', position: 3, name: item.system, item: `${SITE_URL}/${locale}/integrations/${slug}` },
          { '@type': 'ListItem', position: 4, name: linkLabel, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="hero">
        <div className="container">
          <p style={{ marginBottom: 24 }}>
            <Link href={`/${locale}/integrations/${slug}`} className="btn btn-text">← {format(t, 'filesBack', { system: item.system })}</Link>
          </p>
          <div className="integration-hero">
            <Mark name={item.system} logo={mediaUrl(item.logo)} large />
            <div style={{ display: 'grid', gap: 16 }}>
              <h1 className="display">
                <span className="h1-kicker">{kicker}</span> {item.system}
              </h1>
              {item.fileIntro && <p className="hero-sub">{item.fileIntro}</p>}
              <div className="integration-meta">
                {(item.fileFormats || '').split(/,| and /).map((f) => f.trim()).filter(Boolean).map((f) => <span key={f} className="tag">{f}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container detail">
          <div style={{ display: 'grid', gap: 24 }}>
            <section className="card detail-section">
              <h2>{t.filesStep1}</h2>
              <Markdown locale={locale}>{item.fileExport}</Markdown>
            </section>
            <section className="card detail-section">
              <h2>{t.filesStep2}</h2>
              <p>{t.filesStep2Text}{html ? ` ${t.filesStep2Html}` : ''}</p>
            </section>
            {item.fileImport && (
              <section className="card detail-section">
                <h2>{t.filesStep3}</h2>
                <Markdown locale={locale}>{item.fileImport}</Markdown>
              </section>
            )}
            {item.fileKeeps && (
              <section className="card detail-section">
                <h2>{t.filesKeeps}</h2>
                <Markdown locale={locale}>{item.fileKeeps}</Markdown>
              </section>
            )}
            {item.fileLimits && (
              <section className="card detail-section">
                <h2>{t.filesLimits}</h2>
                <Markdown locale={locale}>{item.fileLimits}</Markdown>
              </section>
            )}
          </div>
          <aside className="facts">
            <div className="card">
              <dl>
                <div><dt>{t.filesFormats}</dt><dd>{formats}</dd></div>
                <div><dt>{t.filesAvailability}</dt><dd>{item.fileReleased ? t.filesAvailable : t.filesNextRelease}</dd></div>
              </dl>
              <div style={{ display: 'grid', gap: 8, marginTop: 20 }}>
                {guide && <a className="btn btn-primary btn-block" href={guide} target="_blank" rel="noopener">{t.filesGuide}</a>}
              </div>
            </div>
            <div className="card" style={{ background: 'var(--dark-green)', color: 'var(--solid-white)', borderColor: 'var(--dark-green)', display: 'grid', gap: 12 }}>
              <p style={{ color: '#c9d4d3', fontSize: 14 }}>{format(t, 'filesOrSupertext', { system: item.system })}</p>
              <Link className="btn btn-mint" href={`/${locale}/integrations/${slug}`}>{format(t, 'filesBack', { system: item.system })}</Link>
              <Link className="btn btn-text support-link" href={`/${locale}/support?platform=${slug}`}>{t.supportLink} →</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
