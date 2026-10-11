import { notFound } from 'next/navigation';
import Blocks from '@/components/Blocks';
import { getPage, mediaUrl, translatedLocales } from './strapi';
import { isLocale, strings } from './i18n';
import { JsonLd, alternates, indexingAllowed, social } from './seo';

const pathOf = (slug) => (slug === 'home' ? '' : `/${slug}`);

/** Titles that already name Supertext are used as they are (no "| Supertext" twice). */
const titleOf = (text) => (/supertext/i.test(text || '') ? { absolute: text } : text);

export async function pageMetadata(slug, locale) {
  const page = await getPage(slug, locale).catch(() => null);
  if (!page) return {};
  const seo = page.seo || {};
  const title = seo.metaTitle || page.title;
  const description = seo.metaDescription;
  const path = pathOf(slug);
  const locales = await translatedLocales('/pages', slug);
  const alt = alternates(locale, path, locales);
  return {
    title: titleOf(title),
    description,
    robots: seo.noIndex || !indexingAllowed() ? { index: false, follow: !seo.noIndex } : undefined,
    alternates: alt,
    ...social({ title, description, path: alt.canonical, locale, image: mediaUrl(seo.ogImage) }),
  };
}

/** FAQ blocks as schema.org FAQPage, so search and answer engines can quote them. */
function faqJsonLd(blocks) {
  const items = (blocks || []).filter((b) => b.__component === 'blocks.faq').flatMap((b) => b.items || []);
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.question, acceptedAnswer: { '@type': 'Answer', text: i.answer } })),
  };
}

/** A CMS page: its blocks, top to bottom. */
export async function CmsPage({ slug, locale, searchParams }) {
  if (!isLocale(locale)) notFound();
  const page = await getPage(slug, locale);
  if (!page) notFound();
  const faq = faqJsonLd(page.blocks);
  return (
    <>
      {faq && <JsonLd data={faq} />}
      <Blocks blocks={page.blocks} locale={locale} t={strings(locale)} searchParams={searchParams} />
    </>
  );
}
