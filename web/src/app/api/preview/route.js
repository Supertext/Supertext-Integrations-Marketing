import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/** Called by Strapi's preview pane: /api/preview?secret=…&url=/en/pricing&status=draft */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = process.env.PREVIEW_SECRET;
  if (!secret || searchParams.get('secret') !== secret) return new Response('Invalid preview secret', { status: 401 });
  const url = searchParams.get('url') || '/';
  // Only paths on this site (no //host or full URLs).
  if (!/^\/(?!\/)/.test(url)) return new Response('Invalid url', { status: 400 });
  const draft = await draftMode();
  if (searchParams.get('status') === 'published') draft.disable();
  else draft.enable();
  redirect(url);
}
