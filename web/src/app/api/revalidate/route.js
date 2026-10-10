import { revalidateTag } from 'next/cache';

/** Strapi webhook (entry publish/unpublish): refresh cached content right away. */
export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  revalidateTag('strapi', 'max');
  return Response.json({ revalidated: true });
}
