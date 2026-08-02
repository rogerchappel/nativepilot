import test from 'node:test';
import assert from 'node:assert/strict';
import { createFiles, moduleNameFor, normalizeAppName, packageNameFor, parseProviders } from '../src/templates.js';

test('normalizes app names for directories modules and packages', () => {
  assert.equal(normalizeAppName(' My AI App! '), 'My-AI-App');
  assert.equal(moduleNameFor('my-ai_app'), 'MyAiApp');
  assert.equal(packageNameFor('My_AI App'), 'my-ai-app');
});

test('deduplicates provider selections in user order', () => {
  assert.deepEqual(parseProviders('local,openai,local'), ['local', 'openai']);
});

test('rejects unknown providers clearly', () => {
  assert.throws(() => parseProviders('openai,watson'), /Unknown provider/);
});

test('pins the Expo SDK 57 animation runtime to compatible versions', () => {
  const packageFile = createFiles({ dir: '.', name: 'Runtime App', preset: 'expo', providers: ['local'], force: false })
    .find((file) => file.path === 'package.json');
  assert.ok(packageFile);
  const pkg = JSON.parse(packageFile.content);

  assert.deepEqual({
    'react-native': pkg.dependencies['react-native'],
    'react-native-reanimated': pkg.dependencies['react-native-reanimated'],
    'react-native-worklets': pkg.dependencies['react-native-worklets']
  }, {
    'react-native': '0.86.2',
    'react-native-reanimated': '4.5.1',
    'react-native-worklets': '0.10.1'
  });
});
