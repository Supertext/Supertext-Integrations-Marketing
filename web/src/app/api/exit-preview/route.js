import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request) {
  const url = new URL(request.url).searchParams.get('url') || '/';
  (await draftMode()).disable();
  redirect(/^\/(?!\/)/.test(url) ? url : '/');
}
