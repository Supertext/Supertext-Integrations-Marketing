'use strict';

// Comparison content (October 2026): the /compare page and, per integration, how Supertext
// compares with the system's own translation options. Sources: claude/comparison-research.md
// in the project (vendor docs as of October 2026). No prices.

const API_KEY_URL = 'https://www.supertext.com/en/integrations/api';

const STUDY = 'https://aclanthology.org/2025.mtsummit-2.6/';

const link = (label, url, style = 'primary', newTab = false) => ({ label, url, style, newTab });

const comparePage = {
  title: 'Supertext vs DeepL and Google Translate',
  slug: 'compare',
  seo: {
    metaTitle: 'Supertext vs DeepL and Google Translate | Supertext',
    metaDescription:
      'Supertext, DeepL or Google Translate? Swiss German, Swiss hosting, formal address and professional review compared for website, shop and product content.',
  },
  blocks: [
    {
      __component: 'blocks.hero',
      layout: 'centered',
      eyebrow: 'Comparison',
      title: 'Supertext, DeepL or Google Translate?',
      subtitle:
        'All three translate your content in seconds. The differences show when you write for Switzerland, care where your texts go, or need a translator to check the result.',
      primaryCta: link('Browse integrations', '/en/integrations'),
      secondaryCta: link('Get your API key', API_KEY_URL, 'secondary', true),
    },
    {
      __component: 'blocks.feature-cards',
      title: 'What sets Supertext apart',
      columns: 'two',
      cards: [
        {
          title: 'Writes Swiss German',
          text: 'Supertext writes Swiss German (Bernese and Zurich German), Swiss Standard German, Swiss French and Swiss Italian, and Romansh. DeepL understands Swiss German but doesn’t write it, and has no Swiss French, Swiss Italian or Romansh. Google Translate supports none of them except Swiss French.',
        },
        {
          title: 'Hosted in Switzerland',
          text: 'Your texts are translated in Switzerland, deleted after translation and never used to train AI models (paid plans). DeepL now also processes on servers worldwide by default; Google Cloud offers EU and US regions, not Switzerland.',
        },
        {
          title: 'A translator when it matters',
          text: 'Have a professional translator check the AI translation within minutes, or order a full human translation from more than 3,000 language professionals. DeepL and Google Translate are machine only.',
        },
        {
          title: 'Preferred in a blind test',
          text: `Professional translators preferred Supertext over DeepL in three of four language directions in a blind document-level comparison, [published at MT Summit 2025](${STUDY}).`,
        },
      ],
    },
    {
      __component: 'blocks.comparison-table',
      title: 'Side by side',
      columns: [{ heading: 'Supertext', highlight: true }, { heading: 'DeepL' }, { heading: 'Google Translate' }],
      rows: [
        { label: 'Swiss German (Bernese, Zurich German)', cells: 'Writes it\nUnderstands it, doesn’t write it\n–' },
        { label: 'Swiss Standard German (de-CH)', cells: 'Yes\nYes\n–' },
        { label: 'Swiss French and Swiss Italian', cells: 'Both\n–\nSwiss French (LLM model only)' },
        { label: 'Romansh', cells: 'Yes\n–\n–' },
        { label: 'Formal or informal address', cells: 'Yes\nYes\n–' },
        { label: 'Glossaries', cells: 'Yes\nYes\nYes (Advanced edition)' },
        { label: 'Where texts are processed', cells: 'Switzerland\nEU and worldwide (EU only as an add-on)\nGlobal, EU or US region' },
        { label: 'Texts used for training (paid plans)', cells: 'No\nNo\nNo' },
        { label: 'Professional review by translators', cells: 'Within minutes\n–\n–' },
        { label: 'Human translation', cells: '100+ languages\n–\n–' },
        { label: 'Plugins for your CMS, PIM and shop', cells: '30+ Supertext plugins\nThird-party plugins\nThird-party plugins' },
      ],
      footnote: `As of October 2026, from the vendors’ documentation. Blind test: Flückiger et al., [MT Summit 2025](${STUDY}).`,
    },
    {
      __component: 'blocks.faq',
      title: 'Questions',
      items: [
        {
          question: 'Can I keep using DeepL in my CMS?',
          answer: 'Yes. The Supertext plugins work next to other translation tools. In WordPress with Polylang Pro, Supertext appears right next to DeepL, so you can compare both on your own content.',
        },
        {
          question: 'Which languages does Supertext translate?',
          answer: '28 languages with AI, including Swiss German (Bernese and Zurich German), Swiss Standard German, Swiss French, Swiss Italian and Romansh. Professional translators cover more than 100 languages.',
        },
        {
          question: 'Are my texts used to train AI models?',
          answer: 'Not on paid plans: texts are deleted after translation and never used for training. The free version may use texts to improve the service.',
        },
        {
          question: 'What does “professional review” mean?',
          answer: 'A professional translator checks the AI translation for completeness, meaning, spelling and grammar, often within minutes. For texts that have to be perfect, Supertext also translates by hand.',
        },
      ],
    },
    {
      __component: 'blocks.cta-band',
      tone: 'dark',
      title: 'Try Supertext where your content lives',
      text: 'Free plugins for 30+ systems. Translate a page, compare the result, decide.',
      primaryCta: link('Browse integrations', '/en/integrations', 'primary'),
      secondaryCta: link('Get your API key', API_KEY_URL, 'secondary', true),
    },
  ],
};

/** Per integration: what the system offers itself, and what Supertext adds. Markdown. */
const builtIn = {
  'adobe-experience-manager':
    'AEM’s Translation Integration Framework connects to Microsoft Translator by default; other engines come through partner connectors, and the newer AI translation runs on your own Azure OpenAI account. The Supertext connector plugs into the same framework, so translation projects work as before, with hosting in Switzerland, Swiss language variants and professional review when it matters.',
  apostrophecms:
    'ApostropheCMS offers automatic translation (DeepL, Google, Azure or AI) as an extension that needs a Pro licence; the open source core has none. Supertext works in the same *Localize…* step without a Pro licence, with Swiss variants, formal address and hosting in Switzerland.',
  contao:
    'Contao has no machine translation: a language is a copied page tree that you translate by hand. The common extension adds DeepL field by field. Supertext translates single pages or whole websites in one step from the site structure, into Swiss variants with formal address.',
  'craft-cms':
    'Craft CMS has no built-in machine translation: you retype content per site or add a plugin with DeepL, Google or OpenAI. Supertext translates entries into your other sites from the entry page, Matrix and rich text included, with Swiss variants and hosting in Switzerland.',
  directus:
    'Directus can translate with AI using your own provider key (OpenAI, Anthropic or Google), guided by a style guide and glossary. Supertext adds a service made for translation: Swiss variants, formal address, hosting in Switzerland and a professional translator when it matters.',
  'django-cms':
    'django CMS has no machine translation built in; a newer package adds DeepL. Supertext translates pages and their plugins from the toolbar, into Swiss variants with formal address, hosted in Switzerland.',
  drupal:
    'Drupal core provides the translation structure but no machine translation. The Translation Management Tool adds providers such as DeepL and Google, and the AI module translates with a language model of your choice, without a review step. The Supertext provider brings Supertext into the Translation Management Tool’s jobs and review.',
  ghost:
    'Ghost translates only its own interface. For content, it suggests one Ghost per language or a browser-side service that never stores translations in Ghost. The Supertext connector creates real translated drafts in Ghost, ready to review and publish.',
  grav:
    'Grav’s own AI translation plugin is a paid premium add-on. The Supertext plugin is free and open source, keeps your Markdown intact and translates into Swiss variants with formal address.',
  hubspot:
    'HubSpot’s built-in translation (powered by DeepL) needs Content Hub or Marketing Hub Professional, skips custom modules and has no Swiss German or formal address. Supertext translates pages, blog posts, marketing emails and knowledge base articles into Swiss German, French and Italian with formal address, as drafts to review.',
  joomla:
    'Joomla’s multilingual associations let you translate side by side, by hand; extensions add Google, DeepL or ChatGPT. Supertext creates linked, unpublished language versions of your articles, ready to review, in Swiss variants with formal address.',
  magnolia:
    'Magnolia exports and imports translations as XLIFF; machine translation connectors (DeepL, Google, Microsoft and others) come with its translation extensions. The Supertext module adds *Translate with Supertext* right in the Pages app, with Swiss variants and hosting in Switzerland.',
  neos:
    'Neos has no machine translation in its core; a community package adds DeepL. Supertext works the same automatic way, translating as soon as an editor creates a page in another language, but with Swiss variants, formal address and hosting in Switzerland.',
  'orchard-core':
    'Orchard Core’s localization is manual: you create the culture version and type the translation. Supertext translates content items into your other cultures on demand or as you localize, hosted in Switzerland.',
  'payload-cms':
    'Payload stores localized values per locale but leaves the translating to you; AI translation is advertised for its Enterprise edition. The Supertext plugin adds a *Translate* button to localized collections and globals.',
  silverstripe:
    'Fluent stores translations per locale but doesn’t translate; community modules add DeepL, Google or OpenAI. Supertext translates pages and Elemental blocks into Fluent locales from a Supertext tab, into Swiss variants with formal address.',
  strapi:
    'Strapi’s AI translations need the Growth plan and run on every save of the default locale, overwriting manual edits in the other locales. Supertext translates when you choose to, from the Content Manager, into Swiss variants with formal address and hosted in Switzerland.',
  typo3:
    'TYPO3’s localization wizard copies the texts for you to translate by hand; DeepL extensions add machine translation. Supertext hooks into TYPO3’s own localization without a new interface, translating into Swiss variants with formal address, hosted in Switzerland.',
  umbraco:
    'Umbraco has language variants but no machine translation; packages add DeepL or AI connectors. Supertext adds *Translate with Supertext* to the backoffice, for pages, block lists and grids.',
  wagtail:
    'wagtail-localize has machine translators built in: DeepL, Google Cloud and LibreTranslate. Supertext plugs in as one more, adding Swiss variants, formal address, hosting in Switzerland and a professional translator when it matters.',
  wordpress:
    'Polylang Pro has DeepL built in, one post at a time, as a draft. Supertext sits right next to DeepL in the same menu, so you can compare both on your own content, and adds professional translation orders when a text has to be perfect.',
  'akeneo-pim':
    'Akeneo can translate text attributes in bulk with an AI rule action based on an OpenAI model. Supertext translates products and product models from the product page, into Swiss variants with formal address, hosted in Switzerland.',
  atropim:
    'AtroCore’s paid translations module uses DeepL or Google Translate. The Supertext module is free and open source, with Swiss variants, formal address and hosting in Switzerland.',
  pimcore:
    'Pimcore connects DeepL and translation agencies through its translation providers in the enterprise edition; the open source core has no machine translation. Supertext adds *Translate with Supertext* to Pimcore Studio for documents and data objects.',
  magento:
    'Magento has no machine translation: product names, descriptions and CMS pages are typed in per store view, or translated with extensions using Google, DeepL or AI. Supertext translates products, categories, CMS pages and blocks from the admin lists into your store views, in Swiss variants with formal address.',
  prestashop:
    'PrestaShop translates its own interface, not your catalogue; modules add Google, DeepL or GPT. Supertext translates products, categories and CMS pages from the back-office lists, into Swiss variants with formal address.',
  shopify:
    'Shopify’s Translate & Adapt translates automatically into up to eight languages for shops in Europe and two elsewhere, and doesn’t translate legal policies. Supertext translates products, collections, pages and blog posts into all your shop’s languages, including Swiss variants with formal address.',
  wix:
    'Wix Multilingual translates with an unnamed third-party service on word credits, and new pages and some elements aren’t translated automatically. Supertext translates Wix Stores products and other Multilingual content into Swiss variants with formal address.',
  mailchimp:
    'Mailchimp doesn’t translate email content: readers get Google Translate links, and subject lines can’t be translated. Supertext turns a campaign into one draft per language, each sent to the subscribers with that language.',
  'adobe-indesign':
    'InDesign has no built-in translation; text is usually copied out and back. The Supertext scripts export all text to XLIFF for any translator or CAT tool and bring the translations back with formatting intact.',
  'adobe-illustrator':
    'Illustrator has no XLIFF export: text is translated in place or copied out and back. The Supertext scripts export all text to XLIFF for any translator or CAT tool and bring the translations back with formatting intact.',
  coreldraw:
    'CorelDRAW has proofing tools but no translation; text is usually copied out and back by hand. The Supertext macro exports all text to XLIFF for any translator or CAT tool and imports the translations with formatting intact.',
};

const footerCompare = { label: 'Supertext vs DeepL and Google', url: '/en/compare' };

module.exports = { comparePage, builtIn, footerCompare };
