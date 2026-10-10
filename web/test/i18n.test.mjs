import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRING_TABLES } from '../src/lib/i18n.js';

const placeholders = (s) => (s.match(/\{\w+\}/g) || []).sort();
const urls = (s) => (s.match(/\(\{?[\w:/.-]+\}?\)/g) || []).sort();

test('every language has the same keys, placeholders and links as English', () => {
  const en = STRING_TABLES.en;
  for (const [locale, table] of Object.entries(STRING_TABLES)) {
    assert.deepEqual(Object.keys(table).sort(), Object.keys(en).sort(), `${locale}: keys`);
    for (const key of Object.keys(en)) {
      assert.deepEqual(placeholders(table[key]), placeholders(en[key]), `${locale}.${key}: placeholders`);
      assert.deepEqual(urls(table[key]), urls(en[key]), `${locale}.${key}: links`);
    }
  }
});
