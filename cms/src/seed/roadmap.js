'use strict';

// The roadmap page (November 2026). The Roadmap block lists the integrations by status
// (in development, on the roadmap, open for requests); roadmap items add what isn't an
// integration. The items are created as drafts: publish the ones you want to show.

const link = (label, url, style = 'primary', newTab = false) => ({ label, url, style, newTab });

const roadmapPage = {
  title: 'Roadmap',
  slug: 'roadmap',
  seo: {
    metaTitle: 'Roadmap: upcoming translation plugins | Supertext',
    metaDescription:
      'Which Supertext translation plugins are in development, which are planned next, and which systems you can request. Your requests decide what we build.',
  },
  blocks: [
    {
      __component: 'blocks.hero',
      layout: 'centered',
      eyebrow: 'Roadmap',
      title: 'What we are building next',
      subtitle:
        'The plugins in development, the ones planned next and the systems you can request. Every request counts when we decide what to build.',
      primaryCta: link('Request a plugin', '/en/support?kind=request'),
      secondaryCta: link('Browse integrations', '/en/integrations', 'secondary'),
    },
    {
      __component: 'blocks.roadmap',
      showReleases: true,
      showRequests: true,
    },
    {
      __component: 'blocks.faq',
      title: 'How the roadmap works',
      items: [
        {
          question: 'How do you decide what to build?',
          answer:
            'By how many people ask for a system, how many of our customers use it, and how well it can be connected. Requests from the support page are counted per system.',
        },
        {
          question: 'Can I get a plugin sooner?',
          answer:
            'Yes. If your company needs a system soon, [talk to us](https://www.supertext.com/en/contact): we build plugins for customers first.',
        },
        {
          question: 'Will I hear when my system is available?',
          answer: 'Yes. When you request a plugin, we email you when it goes into development and when it is released.',
        },
        {
          question: 'What can I do until then?',
          answer:
            'Use the [Supertext SDKs](/en/sdk) to connect the system yourself, or export your texts as XLIFF and translate them in Supertext.',
        },
      ],
    },
  ],
};

const roadmapItems = [
  {
    title: 'Review translations on your live website',
    description: 'A browser extension that shows the original next to the translation on your own pages. Corrections go straight back into your CMS.',
    phase: 'now',
    order: 10,
  },
  {
    title: 'Supertext SDKs as packages',
    description: 'The Supertext SDKs on npm, PyPI, NuGet and Packagist, so your own integrations update like any other dependency.',
    phase: 'next',
    url: '/en/sdk',
    order: 20,
  },
  {
    title: 'Supertext in the Shopify App Store',
    description: 'Install the Shopify app straight from the App Store, without a custom installation.',
    phase: 'next',
    order: 30,
  },
];

const footerRoadmap = { label: 'Roadmap', url: '/en/roadmap' };

module.exports = { roadmapPage, roadmapItems, footerRoadmap };
