'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { redact } = require('../src/api/support/services/redact');
const { message, LOCALES } = require('../src/api/support/services/messages');

test('redact removes contact details and secrets', () => {
  const text = [
    'Contact me at anna.muster@example.ch or +41 44 123 45 67.',
    'My key: Supertext-Auth-Key abc123def456',
    'api_key=sk_live_1234567890 and password: hunter2',
    'Token 9f8e7d6c5b4a39281706f5e4d3c2b1a0ffeeddcc in the log',
    'Site https://www.my-shop.example/de/produkte and docs https://github.com/Supertext/Strapi-Supertext-Translation',
    'TYPO3 13.4.12, PHP 8.3.1, released 2026-10-01, order 12345',
  ].join('\n');
  const out = redact(text);
  for (const leaked of ['anna.muster@example.ch', '123 45 67', 'abc123def456', 'sk_live_1234567890', 'hunter2', '9f8e7d6c5b4a39281706f5e4d3c2b1a0ffeeddcc', 'my-shop.example']) {
    assert.ok(!out.includes(leaked), `leaked: ${leaked}`);
  }
  for (const kept of ['https://github.com/Supertext/Strapi-Supertext-Translation', 'TYPO3 13.4.12, PHP 8.3.1, released 2026-10-01, order 12345']) {
    assert.ok(out.includes(kept), `removed too much: ${kept}`);
  }
});

test('support emails exist in every language with the same placeholders', () => {
  const keys = ['receivedSubject', 'received', 'publicNote', 'answerSubject', 'answer', 'bugSubject', 'bug', 'featureSubject', 'feature', 'closedSubject', 'closed', 'fixed', 'follow', 'reply', 'signature'];
  for (const locale of LOCALES) {
    for (const key of keys) {
      const text = message(locale, key, { ref: 'SR-0001', platform: 'TYPO3', url: 'https://github.com/x' });
      assert.ok(!/\{\w+\}/.test(text), `${locale}.${key} has an unfilled placeholder`);
      if (locale !== 'en') assert.notStrictEqual(text, message('en', key, { ref: 'SR-0001', platform: 'TYPO3', url: 'https://github.com/x' }), `${locale}.${key} not translated`);
    }
  }
});
