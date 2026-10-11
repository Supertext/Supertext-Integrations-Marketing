import { SITE_URL, indexingAllowed } from '@/lib/seo';
import { getIntegrations, listAll } from '@/lib/strapi';

// Built on request (the CMS isn't reachable during the build); Strapi responses are cached for a minute.
export const dynamic = 'force-dynamic';

const CATEGORY = { cms: 'Content management systems', pim: 'Product information management', ecommerce: 'E-commerce', email: 'Email marketing', design: 'Design files' };

/**
 * llms.txt (https://llmstxt.org): a plain summary of the site for AI assistants and answer engines,
 * built from the CMS so it never goes stale.
 */
export async function GET() {
  const [integrations, pages] = await Promise.all([getIntegrations('en'), listAll('/pages', 'en', ['slug', 'title'])]);
  const lines = [
    '# Supertext integrations',
    '',
    '> Supertext is a Swiss translation company offering AI translation with optional professional review. Its open source plugins bring Supertext translation into content management systems, PIM systems, online shops, email marketing and design tools; SDKs for TypeScript, PHP, Python, .NET and Java cover everything else. All plugins are free; support and localization services are available as subscriptions.',
    '',
    'Key facts:',
    '- Translations run on Swiss servers; editors review the results in their own system before publishing.',
    '- Target languages are regional (for example de-CH, fr-CH, it-CH), with formal or informal address.',
    '- Each plugin needs a Supertext account and API key: https://www.supertext.com/en/integrations/api',
    '',
    '## Pages',
    ...pages
      .filter((p) => p.slug !== 'home')
      .map((p) => `- [${p.title}](${SITE_URL}/en/${p.slug})${p.slug === 'sdk' ? ': build your own integration with the Supertext API (TypeScript, PHP, Python, .NET, Java)' : ''}`),
    '',
  ];
  for (const [key, label] of Object.entries(CATEGORY)) {
    const items = integrations.filter((i) => i.category === key);
    if (!items.length) continue;
    lines.push(`## ${label}`);
    for (const i of items) {
      const facts = [i.summary, i.supportedVersions && `Supports ${i.supportedVersions}`, i.stage === 'in_development' && 'In development']
        .filter(Boolean)
        .join('. ');
      lines.push(`- [${i.system}](${SITE_URL}/en/integrations/${i.slug}): ${facts}`);
    }
    lines.push('');
  }
  lines.push('## Optional', `- [Supertext website](https://www.supertext.com)`, `- [Source code of all plugins](https://github.com/Supertext)`, '');
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...(indexingAllowed() ? {} : { 'X-Robots-Tag': 'noindex' }),
    },
  });
}
