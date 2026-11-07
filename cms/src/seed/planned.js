'use strict';

// Systems without a Supertext plugin yet (November 2026): the tools listed on
// openloc.com/integrations that Supertext doesn't cover, minus other translation engines
// (DeepL, Google Translate, Microsoft Translator, ModelFront). Status "roadmap" = planned,
// shown on the roadmap page; "request" = not planned yet, visitors can request it.
// [system, category, status, what it would do]
module.exports = [
  // Content management
  ['Contentful', 'cms', 'roadmap', 'Translates entries into other locales from a Contentful app'],
  ['Sanity', 'cms', 'roadmap', 'Translates documents and fields inside Sanity Studio'],
  ['Sitecore', 'cms', 'roadmap', 'Translates Sitecore items into other languages'],
  ['RWS Tridion', 'cms', 'request', 'Translates Tridion Sites pages and components'],
  ['OpenText', 'cms', 'request', 'Translates content in OpenText content management'],
  // Product information
  ['Plytix', 'pim', 'request', 'Translates Plytix product attributes into other languages'],
  // Marketing
  ['Salesforce Marketing Cloud', 'email', 'request', 'Translates Marketing Cloud emails and content blocks'],
  // Design
  ['Figma', 'design', 'roadmap', 'Translates Figma designs into other languages with the layout kept'],
  // Documentation and office
  ['Atlassian Confluence', 'docs', 'roadmap', 'Translates Confluence pages into other languages'],
  ['MadCap Flare', 'docs', 'roadmap', 'Translates MadCap Flare topics and snippets'],
  ['MadCap IXIA CCMS', 'docs', 'request', 'Translates DITA content in IXIA CCMS'],
  ['Paligo', 'docs', 'request', 'Translates Paligo topics and publications'],
  ['Quanos', 'docs', 'request', 'Translates technical documentation in Quanos SCHEMA ST4'],
  ['Kovai Document360', 'docs', 'request', 'Translates Document360 knowledge base articles'],
  ['Veeva Vault', 'docs', 'request', 'Translates documents in Veeva Vault'],
  ['Articulate', 'docs', 'request', 'Translates Articulate Rise and Storyline courses'],
  ['Microsoft SharePoint', 'docs', 'request', 'Translates SharePoint pages and documents'],
  ['Microsoft 365', 'docs', 'request', 'Translates Word, Excel and PowerPoint files in Microsoft 365'],
  ['Google Docs', 'docs', 'request', 'Translates Google Docs with the formatting kept'],
  // Customer support
  ['Zendesk', 'support', 'roadmap', 'Translates Zendesk Help Center articles and macros'],
  ['Freshworks Freshdesk', 'support', 'request', 'Translates Freshdesk knowledge base articles'],
  ['Intercom', 'support', 'request', 'Translates Intercom Help Center articles'],
  ['ServiceNow', 'support', 'request', 'Translates ServiceNow knowledge articles and catalog items'],
  ['Salesforce Service Cloud', 'support', 'request', 'Translates Service Cloud replies and templates'],
  ['Salesforce Knowledge', 'support', 'request', 'Translates Salesforce Knowledge articles'],
  // Project management and collaboration
  ['Atlassian Jira', 'pm', 'request', 'Translates Jira issues and comments'],
  ['Atlassian Trello', 'pm', 'request', 'Translates Trello cards'],
  ['monday.com', 'pm', 'request', 'Translates monday.com items and updates'],
  ['Adobe Workfront', 'pm', 'request', 'Sends Workfront documents to Supertext for translation'],
  ['Notion', 'pm', 'request', 'Translates Notion pages into other languages'],
  ['Salesforce Slack', 'pm', 'request', 'Translates Slack messages'],
  // Developer tools
  ['GitHub', 'code', 'roadmap', 'Translates resource files in GitHub repositories as pull requests'],
  ['GitLab', 'code', 'request', 'Translates resource files in GitLab repositories as merge requests'],
  ['Atlassian Bitbucket', 'code', 'request', 'Translates resource files in Bitbucket repositories as pull requests'],
  ['Git', 'code', 'request', 'Translates resource files in any Git repository'],
  // Automation
  ['n8n', 'automation', 'roadmap', 'A Supertext node for n8n workflows'],
  ['Blackbird', 'automation', 'request', 'Supertext actions for Blackbird workflows'],
  ['BeLazy', 'automation', 'request', 'Supertext jobs in BeLazy project automation'],
  ['UiPath', 'automation', 'request', 'Supertext translation as a UiPath activity'],
  // Terminology and translation tools
  ['RWS Trados Studio', 'language', 'request', 'Supertext AI translation as a provider in Trados Studio'],
  ['RWS MultiTerm', 'language', 'request', 'Your MultiTerm termbases applied to Supertext translations'],
  ['Kaleidoscope Quickterm', 'language', 'request', 'Your Quickterm terminology applied to Supertext translations'],
  ['Interverbum TermWeb', 'language', 'request', 'Your TermWeb terminology applied to Supertext translations'],
  // Reporting
  ['Snowflake', 'analytics', 'request', 'Your Supertext translation data in Snowflake'],
  ['Microsoft Power BI', 'analytics', 'request', 'Reports on your Supertext translations in Power BI'],
  ['Salesforce Tableau', 'analytics', 'request', 'Reports on your Supertext translations in Tableau'],
  ['Google Cloud Looker', 'analytics', 'request', 'Reports on your Supertext translations in Looker'],
  // AI assistants
  ['Claude', 'ai', 'roadmap', 'Translates and reviews content with Supertext from a Claude chat'],
  ['ChatGPT', 'ai', 'request', 'Supertext translation inside ChatGPT'],
  ['Google Gemini', 'ai', 'request', 'Supertext translation inside Gemini'],
  ['Microsoft Copilot', 'ai', 'request', 'Supertext translation inside Microsoft Copilot'],
  ['Mistral AI', 'ai', 'request', 'Supertext translation inside Mistral Le Chat'],
  ['Meta Llama', 'ai', 'request', 'Supertext translation for apps built on Llama'],
  ['Cohere Command', 'ai', 'request', 'Supertext translation for apps built on Cohere Command'],
  ['Cohere Aya', 'ai', 'request', 'Supertext translation for apps built on Cohere Aya'],
  ['xAI Grok', 'ai', 'request', 'Supertext translation inside Grok'],
  ['Snowflake CoWork', 'ai', 'request', 'Supertext translation inside Snowflake CoWork'],
];
