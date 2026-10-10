import { NextResponse } from 'next/server';
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n';

/** Paths without a language go to the visitor's language (Accept-Language), else English. */
export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return NextResponse.next();
  const wanted = (request.headers.get('accept-language') || '')
    .split(',')
    .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase());
  const locale = wanted.find((l) => LOCALES.includes(l)) || DEFAULT_LOCALE;
  return NextResponse.redirect(new URL(`/${locale}${pathname === '/' ? '' : pathname}${search}`, request.url));
}

export const config = {
  matcher: ['/((?!api|_next|health|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
