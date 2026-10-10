import Link from 'next/link';
import { format, isLocale, strings } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Thank you', robots: { index: false } };

async function summary(sessionId) {
  if (!sessionId) return null;
  const base = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/shop/session?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export default async function Thanks({ params, searchParams }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { session_id: sessionId } = await searchParams;
  const t = strings(locale);
  const data = await summary(sessionId);
  const portal = process.env.STRIPE_PORTAL_URL;
  return (
    <div className="container page-simple">
      <h1 className="display">{t.thanksTitle}</h1>
      <p className="hero-sub">{data?.email ? format(t, 'thanksText', { email: data.email }) : t.thanksTextNoEmail}</p>
      <div className="btn-row center">
        {portal && <a className="btn btn-secondary" href={portal} target="_blank" rel="noopener">{t.manageSubscription}</a>}
        <Link className="btn btn-primary" href={`/${locale}`}>{t.backHome}</Link>
      </div>
    </div>
  );
}
