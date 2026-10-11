import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { Archivo, Inter } from 'next/font/google';
import Announcement from '@/components/Announcement';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreviewListener from '@/components/PreviewListener';
import { getGlobal } from '@/lib/strapi';
import { LOCALES, isLocale, strings } from '@/lib/i18n';
import { JsonLd, ORG, SITE_URL, indexingAllowed } from '@/lib/seo';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
// Stand-in for ABC Ginto Nord (the neo heading font) until its files are added.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const global = await getGlobal(locale).catch(() => null);
  const seo = global?.defaultSeo;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo?.metaTitle || 'Supertext integrations', template: '%s | Supertext' },
    description: seo?.metaDescription,
    applicationName: 'Supertext',
    robots: indexingAllowed() ? undefined : { index: false, follow: true },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [{ isEnabled: preview }, global] = await Promise.all([draftMode(), getGlobal(locale).catch(() => null)]);
  const t = strings(locale);
  const strapiOrigin = (process.env.STRAPI_PUBLIC_URL || process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
  return (
    <html lang={locale} className={`${inter.variable} ${archivo.variable}`}>
      <body>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              ORG,
              {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                url: `${SITE_URL}/${locale}`,
                name: 'Supertext integrations',
                inLanguage: locale,
                publisher: { '@id': ORG['@id'] },
              },
            ],
          }}
        />
        {preview && (
          <div className="preview-bar">
            {t.previewMode}
            <a href={`/api/exit-preview?url=/${locale}`}>{t.exitPreview}</a>
            <PreviewListener strapiOrigin={new URL(strapiOrigin).origin} />
          </div>
        )}
        <Announcement announcement={global?.announcement} locale={locale} />
        <Header global={global} locale={locale} t={t} />
        <main>{children}</main>
        <Footer global={global} locale={locale} t={t} />
      </body>
    </html>
  );
}
