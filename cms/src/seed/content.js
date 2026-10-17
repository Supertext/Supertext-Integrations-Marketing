'use strict';

// English starter content. Editors change it in the admin; translate it with the Supertext panel.
// Service plans are placeholders until the real offer is defined.

const ACCOUNT_URL = 'https://www.supertext.com/person/en/account/signin';
const API_KEY_URL = 'https://www.supertext.com/en/integrations/api';

const plans = [
  {
    name: 'Community', slug: 'community', kind: 'support', order: 10,
    tagline: 'For teams that install and run the plugin themselves.', audience: 'Self-service',
    priceMonthly: 0, priceAnnual: 0, priceNote: 'Free, with your Supertext plan', ctaLabel: 'Get the plugin',
    contactOnly: false, contactUrl: '/en/integrations', askPlatform: false,
    features: [
      { text: 'All plugins, open source', included: true },
      { text: 'Installation and user guides', included: true },
      { text: 'Issues on GitHub', included: true },
      { text: 'Response time commitment', included: false },
    ],
  },
  {
    name: 'Plugin Support', slug: 'plugin-support', kind: 'support', order: 20, highlight: true, badge: 'Most popular',
    tagline: 'Help with setup, updates and questions for one platform.', audience: 'For one platform',
    priceMonthly: 90, priceAnnual: 75, priceNote: 'per platform', ctaLabel: 'Subscribe', askPlatform: true,
    features: [
      { text: 'Installation and configuration help', included: true },
      { text: 'Update checks for new CMS versions', included: true },
      { text: 'Email support: 24-hour response time', included: true },
      { text: 'Language setup review', included: true },
    ],
  },
  {
    name: 'Localization Service', slug: 'localization-service', kind: 'localization', order: 30,
    tagline: 'We look after your multilingual site: translation workflow, review and launch.', audience: 'Managed for you',
    priceMonthly: 490, priceAnnual: 410, priceNote: 'plus translation credits', ctaLabel: 'Subscribe', askPlatform: true,
    features: [
      { text: 'Everything in Plugin Support', included: true },
      { text: 'Translation workflow set up in your CMS', included: true },
      { text: 'Monthly professional review hours', included: true },
      { text: 'Premium support: 60-minute response time', included: true },
    ],
  },
  {
    name: 'Enterprise', slug: 'enterprise', kind: 'bundle', order: 40, contactOnly: true,
    contactUrl: 'https://www.supertext.com/en/contact',
    tagline: 'Several platforms, custom integrations and a dedicated contact.', audience: 'Tailored',
    priceNote: 'Agreed with you', ctaLabel: 'Talk to sales', askPlatform: false,
    features: [
      { text: 'All platforms you run', included: true },
      { text: 'Custom content types and workflows', included: true },
      { text: 'Private cloud or on-premises', included: true },
      { text: 'Dedicated Key Account Manager', included: true },
    ],
  },
];

const { sdkAnnouncement, sdkNavLink } = require('./announcements');
const { sdkPage, homeSdkBlock, navSdk, footerSdk } = require('./sdk');

const link = (label, url, style = 'primary', newTab = false) => ({ label, url, style, newTab });

const home = {
  title: 'Home', slug: 'home',
  seo: { metaTitle: 'Supertext integrations', metaDescription: 'Supertext AI translation inside the CMS, PIM, shop and design tools you already use.' },
  blocks: [
    {
      __component: 'blocks.hero', layout: 'centered', eyebrow: '30+ integrations',
      title: 'Translate where your content lives',
      subtitle: 'Supertext AI translation inside your CMS, PIM, shop and design tools. Pick the languages, click translate, review the result.',
      primaryCta: link('Browse integrations', '/en/integrations'),
      secondaryCta: link('See plans', '/en/pricing', 'secondary'),
    },
    { __component: 'blocks.integration-grid', title: 'Works with the systems you already use', category: 'all', showFilters: true },
    homeSdkBlock,
    {
      __component: 'blocks.feature-cards', title: 'How it works', columns: 'three',
      cards: [
        { title: 'Install the plugin', text: 'Each plugin installs the way your system expects: Composer, npm, NuGet, a package or an app.' },
        { title: 'Add your API key', text: `No Supertext account yet? [Create one at supertext.com](${ACCOUNT_URL}). Generate your API key at [supertext.com → Integrations → API](${API_KEY_URL}) (requires the Admin role).` },
        { title: 'Translate and review', text: 'Translate pages, products or campaigns in the system’s own interface, then review before you publish.' },
      ],
    },
    {
      __component: 'blocks.cta-band', tone: 'dark', title: 'Need a hand with your setup?',
      text: 'Support and localization subscriptions for every platform we integrate with.',
      primaryCta: link('See plans', '/en/pricing'),
    },
  ],
};

const integrationsPage = {
  title: 'Integrations', slug: 'integrations',
  seo: { metaTitle: 'Integrations | Supertext', metaDescription: 'All Supertext plugins for CMS, PIM, e-commerce, email marketing and design files.' },
  blocks: [
    {
      __component: 'blocks.hero', layout: 'centered', title: 'All Supertext integrations',
      subtitle: 'Open source plugins that bring Supertext AI translation into the tools your teams already use.',
    },
    { __component: 'blocks.integration-grid', category: 'all', showFilters: true },
    {
      __component: 'blocks.notice', tone: 'info',
      text: `**Getting started:** [create a Supertext account](${ACCOUNT_URL}), generate an API key under [Integrations → API](${API_KEY_URL}) and follow the plugin’s installation guide.`,
    },
  ],
};

const pricingPage = (planIds) => ({
  title: 'Pricing', slug: 'pricing',
  seo: { metaTitle: 'Plans | Supertext integrations', metaDescription: 'Support and localization subscriptions for the Supertext plugins.' },
  blocks: [
    {
      __component: 'blocks.hero', layout: 'centered', title: 'Choose the support that fits your platform',
      subtitle: 'The plugins are free. Add support or a managed localization service when your site matters.',
    },
    { __component: 'blocks.plan-cards', showBillingToggle: true, annualSavingLabel: '-17%', plans: planIds },
    {
      __component: 'blocks.feature-cards', title: 'What a subscription covers', subtitle: 'For the platform you choose at checkout.', columns: 'three',
      cards: [
        { title: 'Setup', text: 'We install and configure the plugin with you, including languages and permissions.' },
        { title: 'Updates', text: 'We check the plugin against new versions of your CMS and tell you when to update.' },
        { title: 'Questions', text: 'Ask us anything about translating in your system, by email, with guaranteed response times.' },
      ],
    },
    {
      __component: 'blocks.comparison-table', title: 'Detailed plans comparison',
      columns: [
        { heading: 'Community', price: 'Free' },
        { heading: 'Plugin Support', price: 'CHF 90', subheading: 'per month', highlight: true, badge: 'Most popular' },
        { heading: 'Localization Service', price: 'CHF 490', subheading: 'per month' },
        { heading: 'Enterprise', price: 'Custom' },
      ],
      rows: [
        { label: 'Platforms', cells: 'All\n1\n1\nAll you run' },
        { label: 'Support', cells: 'GitHub issues\n24 hours\n60 minutes\n60 minutes + KAM' },
        { label: 'Setup help', cells: '–\nIncluded\nIncluded\nIncluded' },
        { label: 'Professional review', cells: '–\n–\nMonthly hours\nCustom' },
      ],
      footnote: 'Example plans: prices and contents will be confirmed.',
    },
    {
      __component: 'blocks.faq', title: 'Questions',
      items: [
        { question: 'Do I need a subscription to use a plugin?', answer: 'No. All plugins are free and open source. You need a Supertext account and API key for the translations.' },
        { question: 'Can I cancel?', answer: 'Yes. Monthly plans end with the current month, annual plans with the current year. Manage your subscription in the customer portal.' },
      ],
    },
    {
      __component: 'blocks.cta-band', tone: 'accent', title: 'Running several platforms?',
      text: 'Let’s put together a plan for all of them.', primaryCta: link('Talk to sales', 'https://www.supertext.com/en/contact', 'primary', true),
    },
  ],
});

const global = {
  siteName: 'Supertext',
  announcement: sdkAnnouncement,
  loginLink: link('Login', ACCOUNT_URL, 'text', true),
  headerCta: link('Get your API key', API_KEY_URL, 'primary', true),
  navigation: [
    {
      label: 'Integrations', url: '/en/integrations',
      links: [
        { label: 'Content management', url: '/en/integrations?category=cms', description: 'WordPress, TYPO3, Strapi, HubSpot and 17 more' },
        { label: 'Product information', url: '/en/integrations?category=pim', description: 'Akeneo, AtroPIM, Pimcore' },
        { label: 'E-commerce', url: '/en/integrations?category=ecommerce', description: 'Magento, PrestaShop, Shopify, Wix' },
        { label: 'Email marketing', url: '/en/integrations?category=email', description: 'Mailchimp' },
        { label: 'Design files', url: '/en/integrations?category=design', description: 'InDesign, Illustrator, CorelDRAW' },
      ],
    },
    { label: 'Pricing', url: '/en/pricing' },
    navSdk,
    {
      label: 'Resources',
      links: [
        sdkNavLink,
        { label: 'API documentation', url: 'https://www.supertext.com/en/documentation/api', description: 'The Supertext API behind every plugin' },
        { label: 'GitHub', url: 'https://github.com/Supertext', description: 'Source code, guides and releases' },
      ],
    },
  ],
  footerColumns: [
    { label: 'Integrations', links: [
      { label: 'All integrations', url: '/en/integrations' },
      { label: 'Pricing', url: '/en/pricing' },
      footerSdk,
    ] },
    { label: 'Get started', links: [
      { label: 'Create a Supertext account', url: ACCOUNT_URL },
      { label: 'Generate your API key', url: API_KEY_URL },
    ] },
    { label: 'Company', links: [
      { label: 'About', url: 'https://www.supertext.com/en/about-supertext' },
      { label: 'Contact', url: 'https://www.supertext.com/en/contact' },
      { label: 'Security', url: 'https://www.supertext.com/en/solutions/security' },
    ] },
    { label: 'Legal', links: [
      { label: 'Legal notice', url: 'https://www.supertext.com/en/imprint' },
      { label: 'T&Cs', url: 'https://www.supertext.com/en/gtc' },
      { label: 'Privacy policy', url: 'https://www.supertext.com/en/privacy' },
    ] },
  ],
  footerNote: 'Proudly built and hosted in Switzerland 🇨🇭',
  defaultSeo: { metaTitle: 'Supertext integrations', metaDescription: 'Supertext AI translation for your CMS, PIM, shop and design tools.' },
};

module.exports = { plans, home, integrationsPage, pricingPage, sdkPage, global };
