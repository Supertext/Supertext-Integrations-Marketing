/** Forwards a checkout request to the CMS, which talks to Stripe. Returns { url } of Stripe Checkout. */
export async function POST(request) {
  const base = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
  let body;
  try {
    const { plan, interval, locale, platform } = await request.json();
    body = JSON.stringify({ plan, interval: interval === 'year' ? 'year' : 'month', locale, platform });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    const res = await fetch(`${base}/api/shop/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    return Response.json(res.ok ? { url: data.url } : { error: data.error }, { status: res.status });
  } catch {
    return Response.json({ error: null }, { status: 502 });
  }
}
