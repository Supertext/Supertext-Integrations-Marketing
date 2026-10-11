const { test } = require('node:test');
const assert = require('node:assert/strict');
const integrations = require('../src/seed/integrations');
const { previewPath } = require('../src/preview');

test('seed integrations have unique slugs, valid categories and repos', () => {
  const slugs = integrations.map((i) => i.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const i of integrations) {
    assert.ok(['cms', 'pim', 'ecommerce', 'email', 'design'].includes(i.category), i.system);
    assert.ok(i.repo === null || /^Supertext\/[\w.-]+$/.test(i.repo), i.system);
    assert.ok(i.summary && i.url, i.system);
  }
});

test('preview paths', () => {
  assert.equal(previewPath('api::page.page', { slug: 'home' }, 'de'), '/de');
  assert.equal(previewPath('api::page.page', { slug: 'pricing' }, 'en'), '/en/pricing');
  assert.equal(previewPath('api::integration.integration', { slug: 'strapi' }, 'fr'), '/fr/integrations/strapi');
  assert.equal(previewPath('api::subscription.subscription', {}, 'en'), null);
});

test('every screenshot source belongs to a seeded integration with a repo', () => {
  const screenshots = require('../src/seed/screenshots');
  const bySlug = new Map(integrations.map((i) => [i.slug, i]));
  for (const [slug, source] of Object.entries(screenshots)) {
    assert.ok(bySlug.get(slug)?.repo, `${slug} has a repo`);
    assert.match(source, /^docs\/[\w./-]+\.(png|jpe?g)$/, slug);
  }
});
