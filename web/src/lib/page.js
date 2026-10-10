import { notFound } from 'next/navigation';
import Blocks from '@/components/Blocks';
import { getPage, mediaUrl } from './strapi';
import { isLocale, strings } from './i18n';

export async function pageMetadata(slug, locale) {
  const page = await getPage(slug, locale).catch(() => null);
  if (!page) return {};
  const seo = page.seo || {};
  const image = mediaUrl(seo.ogImage);
  return {
    title: slug === 'home' ? { absolute: seo.metaTitle || page.title } : seo.metaTitle || page.title,
    description: seo.metaDescription,
    robots: seo.noIndex ? { index: false } : undefined,
    alternates: { canonical: slug === 'home' ? `/${locale}` : `/${locale}/${slug}` },
    ...(image && { openGraph: { images: [image] } }),
  };
}

/** A CMS page: its blocks, top to bottom. */
export async function CmsPage({ slug, locale, searchParams }) {
  if (!isLocale(locale)) notFound();
  const page = await getPage(slug, locale);
  if (!page) notFound();
  return <Blocks blocks={page.blocks} locale={locale} t={strings(locale)} searchParams={searchParams} />;
}
