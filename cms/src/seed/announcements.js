'use strict';

const SDK_REPO = 'https://github.com/Supertext/Supertext-API-SDK-and-Guide';

const sdkAnnouncement = {
  enabled: true,
  label: 'New',
  text: 'Supertext SDKs for TypeScript, PHP, Python, .NET and Java, with an integration guide built from 30+ plugins',
  link: { label: 'Get the SDK', url: '/en/sdk', style: 'text', newTab: false },
};

const sdkNavLink = {
  label: 'SDKs and integration guide',
  url: '/en/sdk',
  description: 'Build your own integration: TypeScript, PHP, Python, .NET, Java',
};

module.exports = { SDK_REPO, sdkAnnouncement, sdkNavLink };
