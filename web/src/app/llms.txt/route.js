import { SITE_URL, indexingAllowed } from '@/lib/seo';
import { getArticles, getIntegrations, listAll } from '@/lib/strapi';

const PAGE_NOTES = {
  sdk: 'build your own integration with the Supertext API (TypeScript, PHP, Python, .NET, Java)',
  roadmap: 'Supertext plugins in development and planned next, and the systems people can request',
  compare: 'how Supertext compares with DeepL and Google Translate: Swiss German, Swiss Standard German, Swiss French and Italian, Romansh, hosting in Switzerland, formal address, professional review',
};

// Built on request (the CMS isn't reachable during the build); Strapi responses are cached for a minute.

export const dynamic = 'force-dynamic';

const CATEGORY = {
  cms: 'Content management systems',
  pim: 'Product information management',
  ecommerce: 'E-commerce',
  email: 'Email marketing',
  design: 'Design files',
  docs: 'Documentation and office',
  support: 'Customer support',
  pm: 'Project management and collaboration',
  code: 'Developer tools',
  automation: 'Automation',
  language: 'Terminology and CAT tools',
  analytics: 'Reporting',
  ai: 'AI assistants',
};

/**
 * llms.txt (https://llmstxt.org): a plain summary of the site for AI assistants and answer engines,
 * built from the CMS so it never goes stale.
 */
export async function GET() {
  const [integrations, pages, news] = await Promise.all([getIntegrations('en'), listAll('/pages', 'en', ['slug', 'title']), getArticles('en', 20).catch(() => [])]);
  const lines = [
    '# Supertext integrations',
    '',
    '> Supertext is a Swiss translation company offering AI translation with optional professional review. Its open source plugins bring Supertext translation into content management systems, PIM systems, online shops, marketing platforms and design tools; SDKs for TypeScript, PHP, Python, .NET and Java cover everything else. All plugins are free; support and localization services are available as subscriptions.',
    '',
    'Key facts:',
    '- Translations run on Swiss servers; editors review the results in their own system before publishing.',
    '- Target languages are regional (for example de-CH, fr-CH, it-CH), with formal or informal address.',
    '- Each plugin needs a Supertext account and API key: https://www.supertext.com/en/integrations/api',
    '',
    '## Pages',
    ...pages
      .filter((p) => p.slug !== 'home')
      .map((p) => `- [${p.title}](${SITE_URL}/en/${p.slug})${PAGE_NOTES[p.slug] ? `: ${PAGE_NOTES[p.slug]}` : ''}`),
    '',
  ];
  const plugins = integrations.filter((i) => !i.stage || i.stage === 'live' || i.stage === 'in_development');
  for (const [key, label] of Object.entries(CATEGORY)) {
    const items = plugins.filter((i) => i.category === key);
    if (!items.length) continue;
    lines.push(`## ${label}`);
    for (const i of items) {
      const facts = [
        i.summary,
        i.supportedVersions && `Supports ${i.supportedVersions}`,
        i.fileFormats && `${i.fileFormats} export and import for your own CAT tool or agency: ${SITE_URL}/en/integrations/${i.slug}/files`,
        i.stage === 'in_development' && 'In development',
      ]
        .filter(Boolean)
        .join('. ');
      lines.push(`- [${i.system}](${SITE_URL}/en/integrations/${i.slug}): ${facts}`);
    }
    lines.push('');
  }
  // Systems without a plugin yet.
  const planned = integrations.filter((i) => i.stage === 'roadmap');
  if (planned.length) {
    lines.push(`## On the roadmap (no plugin yet): ${SITE_URL}/en/roadmap`);
    for (const i of planned) lines.push(`- ${i.system} (${CATEGORY[i.category] || i.category}): ${i.summary}`);
    lines.push('');
  }
  const requestable = integrations.filter((i) => i.stage === 'request');
  if (requestable.length) {
    lines.push(`## Not built yet, can be requested: ${SITE_URL}/en/support?kind=request`);
    lines.push(requestable.map((i) => i.system).join(', '), '');
  }
  if (news.length) {
    lines.push(`## News: ${SITE_URL}/en/news`);
    for (const a of news) lines.push(`- [${a.title}](${SITE_URL}/en/news/${a.slug}) (${a.date.slice(0, 10)}): ${a.excerpt}`);
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
