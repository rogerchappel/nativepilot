import test from 'node:test';
import assert from 'node:assert/strict';
import { moduleNameFor, normalizeAppName, packageNameFor, parseProviders } from '../src/templates.js';

test('normalizes app names for directories modules and packages', () => {
  assert.equal(normalizeAppName(' My AI App! '), 'My-AI-App');
  assert.equal(moduleNameFor('my-ai_app'), 'MyAIApp');
  assert.equal(packageNameFor('My_AI App'), 'my-ai-app');
});

test('deduplicates provider selections in user order', () => {
  assert.deepEqual(parseProviders('local,openai,local'), ['local', 'openai']);
});

test('rejects unknown providers clearly', () => {
  assert.throws(() => parseProviders('openai,watson'), /Unknown provider/);
});
