import { notFound } from 'next/navigation';
import SupportForm from '@/components/SupportForm';
import { getIntegrations, hasPlugin } from '@/lib/strapi';
import { isLocale, LOCALES, strings } from '@/lib/i18n';
import { alternates, indexingAllowed, social } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = strings(locale);
  const alt = alternates(locale, '/support', LOCALES);
  return {
    title: { absolute: t.supportMetaTitle },
    description: t.supportMetaDescription,
    alternates: alt,
    robots: indexingAllowed() ? undefined : { index: false, follow: true },
    ...social({ title: t.supportMetaTitle, description: t.supportMetaDescription, path: alt.canonical, locale }),
  };
}

export default async function SupportPage({ params, searchParams }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { platform, kind } = await searchParams;
  const t = strings(locale);
  const all = (await getIntegrations(locale).catch(() => [])).map((i) => ({ slug: i.slug, system: i.system, category: i.category, stage: i.stage }));
  all.sort((a, b) => a.system.localeCompare(b.system, locale));
  // Questions and problems are about existing plugins; requests about systems without one yet.
  const platforms = all.filter(hasPlugin);
  const requestable = all.filter((i) => !hasPlugin(i));
  return (
    <>
      <section className="hero">
        <div className="container" style={{ display: 'grid', gap: 16, maxWidth: 760, textAlign: 'center' }}>
          <h1 className="display">{t.supportHeading}</h1>
          <p className="hero-sub">{t.supportIntro}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <SupportForm
            locale={locale}
            t={t}
            platforms={platforms}
            requestable={requestable}
            initialKind={kind === 'request' || requestable.some((p) => p.slug === platform) ? 'request' : ['bug', 'feature'].includes(kind) ? kind : 'question'}
            initialPlatform={all.some((p) => p.slug === platform) ? platform : ''}
            turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || null}
          />
        </div>
      </section>
    </>
  );
}
