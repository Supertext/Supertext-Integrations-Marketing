const FIELDS = ['platform', 'kind', 'subject', 'message', 'systemVersion', 'pluginVersion', 'name', 'company', 'email', 'locale', 'website', 'elapsedMs', 'turnstileToken'];

/**
 * Forwards a support request to the CMS, server-side with the shared token, together with the
 * visitor's address (for the CMS's rate limit). Returns { reference, issueUrl } or { error, code }.
 */
export async function POST(request) {
  const base = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
  let input;
  try {
    input = await request.json();
  } catch {
    return Response.json({ code: 'invalid' }, { status: 400 });
  }
  const body = JSON.stringify(Object.fromEntries(FIELDS.filter((k) => input[k] !== undefined).map((k) => [k, input[k]])));
  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '').split(',')[0].trim();
  try {
    const res = await fetch(`${base}/api/support/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        ...(ip && { 'X-Visitor-IP': ip }),
      },
      body,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(res.ok ? { reference: data.reference, issueUrl: data.issueUrl } : { code: data.code || 'unavailable' }, { status: res.status });
  } catch {
    return Response.json({ code: 'unavailable' }, { status: 502 });
  }
}
