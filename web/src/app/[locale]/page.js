import { CmsPage, pageMetadata } from '@/lib/page';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata('home', locale);
}

export default async function Home({ params, searchParams }) {
  const { locale } = await params;
  return <CmsPage slug="home" locale={locale} searchParams={await searchParams} />;
}
