import { notFound } from 'next/navigation';
import SupportForm from '@/components/SupportForm';
import { getIntegrations } from '@/lib/strapi';
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
  const { platform } = await searchParams;
  const t = strings(locale);
  const platforms = (await getIntegrations(locale).catch(() => [])).map((i) => ({ slug: i.slug, system: i.system }));
  platforms.sort((a, b) => a.system.localeCompare(b.system, locale));
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
            initialPlatform={platforms.some((p) => p.slug === platform) ? platform : ''}
            turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || null}
          />
        </div>
      </section>
    </>
  );
}
