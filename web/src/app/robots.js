import { SITE_URL, indexingAllowed } from '@/lib/seo';

// Read on request, so ALLOW_INDEXING takes effect without a rebuild.
export const dynamic = 'force-dynamic';

// AI crawlers named explicitly, so answer engines (ChatGPT, Claude, Perplexity, Gemini…) can cite the site.
const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export default function robots() {
  if (!indexingAllowed()) {
    // Not launched yet (ALLOW_INDEXING isn't true): keep everything out of search results.
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/*/shop/'] },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: ['/api/', '/*/shop/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
