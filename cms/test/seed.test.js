const { test } = require('node:test');
const assert = require('node:assert/strict');
const integrations = require('../src/seed/integrations');
const { previewPath } = require('../src/preview');

test('seed integrations have unique slugs, valid categories and repos', () => {
  const slugs = integrations.map((i) => i.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  const schema = require('../src/api/integration/content-types/integration/schema.json').attributes;
  for (const i of integrations) {
    assert.ok(schema.category.enum.includes(i.category), i.system);
    assert.ok(schema.stage.enum.includes(i.stage), i.system);
    assert.ok(i.repo === null || /^Supertext\/[\w.-]+$/.test(i.repo), i.system);
    // Systems without a plugin yet have no repo or link.
    assert.ok(i.summary && (i.url || ['roadmap', 'request'].includes(i.stage)), i.system);
  }
});

test('systems without a plugin yet', () => {
  const planned = integrations.filter((i) => ['roadmap', 'request'].includes(i.stage));
  assert.ok(planned.length > 0);
  for (const i of planned) assert.ok(!i.repo && !i.url && i.summary.length <= 90, i.slug);
  // Not the same system twice under another name.
  const names = new Set(integrations.filter((i) => !planned.includes(i)).map((i) => i.slug));
  for (const i of planned) assert.ok(!names.has(i.slug), i.slug);
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

test('every seeded plugin has details', () => {
  for (const i of integrations.filter((x) => ['live', 'in_development'].includes(x.stage))) {
    assert.ok(i.technology && i.aboutSystem && i.description, `${i.slug}: technology, about, description`);
    assert.ok(i.features.length >= 3, `${i.slug}: features`);
  }
});
