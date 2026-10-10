import { CmsPage, pageMetadata } from '@/lib/page';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  return pageMetadata(slug.join('/'), locale);
}

export default async function Page({ params, searchParams }) {
  const { locale, slug } = await params;
  return <CmsPage slug={slug.join('/')} locale={locale} searchParams={await searchParams} />;
}
