'use strict';

// Support texts become public GitHub issues. Contact details stay in the CMS; anything in the
// free text that looks like personal data or a secret is removed before it leaves.

const KEEP_HOSTS = /(^|\.)(github\.com|supertext\.com|supertext\.ch)$/i;

const RULES = [
  // Supertext API keys, with or without the header prefix.
  [/Supertext-Auth-Key\s+\S+/gi, 'Supertext-Auth-Key [key removed]'],
  // key=value / key: value for secrets.
  [/\b(api[_-]?key|apikey|token|secret|password|passwd|pwd|authorization)(["']?\s*[:=]\s*["']?)[^\s"',;]+/gi, '$1$2[removed]'],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/g, 'Bearer [removed]'],
  // Email addresses.
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email removed]'],
  // Phone numbers: + or 0 followed by at least 9 more digits.
  [/(?<![\w.])(?:\+|00|0)\d[\d\s()/.-]{7,}\d(?!\w)/g, (m) => (m.replace(/\D/g, '').length >= 10 ? '[phone removed]' : m)],
  // Long random-looking strings (keys, tokens): 32+ characters of letters and digits mixed.
  [/\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{32,}\b/g, '[secret removed]'],
];

/** Removes contact details and secrets from text that will be public. */
function redact(text) {
  if (!text) return text;
  let out = String(text);
  // Links to customer sites reveal who the customer is; links to GitHub and Supertext stay.
  out = out.replace(/\bhttps?:\/\/[^\s)<>"']+/gi, (url) => {
    try {
      return KEEP_HOSTS.test(new URL(url).hostname) ? url : '[link removed]';
    } catch {
      return '[link removed]';
    }
  });
  for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement);
  return out;
}

module.exports = { redact };
