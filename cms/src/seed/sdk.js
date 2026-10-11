'use strict';

// The Supertext SDKs (github.com/Supertext/Supertext-API-SDK-and-Guide): the /sdk page,
// the start-page section and the menu links that point to it.
const SDK_REPO = 'https://github.com/Supertext/Supertext-API-SDK-and-Guide';
const GUIDE = `${SDK_REPO}/blob/main/docs/integration-guide.md`;
const ACCOUNT_URL = 'https://www.supertext.com/person/en/account/signin';
const API_KEY_URL = 'https://www.supertext.com/en/integrations/api';

const link = (label, url, style = 'primary', newTab = false) => ({ label, url, style, newTab });

const LANGUAGES = [
  ['TypeScript / JavaScript', 'npm install supertext-sdk', 'Node 18+, Deno, Bun; no dependencies.', 'typescript'],
  ['PHP', 'composer require supertext/supertext-sdk', 'PHP 8.1+; no dependencies (ext-curl only for the built-in HTTP transport).', 'php'],
  ['Python', 'pip install supertext-sdk', 'Python 3.10+; standard library only.', 'python'],
  ['.NET', 'dotnet add package Supertext.Sdk', '.NET 8+.', 'dotnet'],
  ['Java', 'com.supertext:supertext-sdk (Maven)', 'Java 11+; no dependencies.', 'java'],
];

const sdkPage = {
  title: 'Supertext SDKs',
  slug: 'sdk',
  seo: {
    metaTitle: 'Supertext SDKs and integration guide',
    metaDescription: 'Build your own Supertext integration: SDKs for TypeScript, PHP, Python, .NET and Java, and a guide built from 30+ plugins.',
  },
  blocks: [
    {
      __component: 'blocks.hero',
      layout: 'centered',
      eyebrow: 'For developers',
      title: 'Build your own Supertext integration',
      subtitle: 'No plugin for your system yet? The Supertext SDKs for TypeScript, PHP, Python, .NET and Java handle the tricky parts of the API, with an integration guide built from more than 30 plugins.',
      primaryCta: link('SDKs on GitHub', SDK_REPO, 'primary', true),
      secondaryCta: link('Read the integration guide', GUIDE, 'secondary', true),
    },
    {
      __component: 'blocks.feature-cards',
      title: 'Five languages, one API',
      subtitle: 'All SDKs offer the same features, named the way each language expects.',
      columns: 'three',
      cards: LANGUAGES.map(([title, install, requirements, dir]) => ({
        title,
        text: `\`${install}\`\n\n${requirements}`,
        link: link('Documentation', `${SDK_REPO}/tree/main/sdk/${dir}`, 'text', true),
      })),
    },
    {
      __component: 'blocks.rich-text',
      width: 'narrow',
      body: [
        '## What the SDKs do for you',
        '',
        '- **Many texts in one go**: keyed texts, plain or HTML, split into documents under the size limit and read back by key.',
        '- **Language codes handled**: source as a bare language (`en`), target with a region (`de-CH`), checked before the request.',
        '- **Errors you can show**: one error type with stable codes such as `authentication_failure`, `invalid_language_pair` or `quota_exceeded`.',
        '- **The fiddly parts built in**: the auth header, the exact upload format, retries on rate limits, polling with a timeout and cleaning up afterwards.',
        '- **Testing without a key**: a stand-in API and test vectors for your own tests.',
        '',
        '## A quick look',
        '',
        '```ts',
        "import { SupertextClient } from 'supertext-sdk'",
        '',
        "const client = new SupertextClient(process.env.SUPERTEXT_API_KEY ?? '')",
        'const german = await client.translateTexts(',
        "  { title: 'Hello & welcome', body: { text: '<p>Our <b>new</b> shop opens on Monday.</p>', html: true } },",
        "  'de-CH',",
        "  { sourceLang: 'en', politeness: 'more' },",
        ')',
        '```',
      ].join('\n'),
    },
    {
      __component: 'blocks.notice',
      tone: 'highlight',
      text: `**Getting started:** you need a Supertext API key. No Supertext account yet? [Create one at supertext.com](${ACCOUNT_URL}). Generate your API key at [supertext.com → Integrations → API](${API_KEY_URL}) (requires the Admin role). The packages aren't on the public registries yet: install them from the [repository or a release](${SDK_REPO}/releases).`,
    },
    {
      __component: 'blocks.cta-band',
      tone: 'dark',
      title: 'Prefer a ready-made plugin?',
      text: 'Supertext works out of the box in 30+ CMS, PIM, shop and design tools.',
      primaryCta: link('Browse integrations', '/en/integrations'),
      secondaryCta: link('Talk to us', 'https://www.supertext.com/en/contact', 'secondary', true),
    },
  ],
};

/** Start page: right after the integration grid. */
const homeSdkBlock = {
  __component: 'blocks.cta-band',
  tone: 'light',
  title: 'Your system isn’t listed?',
  text: 'Build the integration yourself with the Supertext SDKs for TypeScript, PHP, Python, .NET and Java.',
  primaryCta: link('See the SDKs', '/en/sdk'),
  secondaryCta: link('SDKs on GitHub', SDK_REPO, 'secondary', true),
};

const navSdk = { label: 'SDK', url: '/en/sdk' };
const footerSdk = { label: 'SDKs and integration guide', url: '/en/sdk' };

module.exports = { SDK_REPO, sdkPage, homeSdkBlock, navSdk, footerSdk };
