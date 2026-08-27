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

test('uses every provider only when the option is omitted', () => {
  assert.deepEqual(parseProviders(undefined), ['openai', 'anthropic', 'gemini', 'local']);
});

test('rejects empty provider selections with supported choices', () => {
  for (const value of ['', '   ', ',,,', ' , , ']) {
    assert.throws(() => parseProviders(value), /cannot be empty.*openai,anthropic,gemini,local/i);
  }
});

test('rejects unknown providers clearly', () => {
  assert.throws(() => parseProviders('openai,watson'), /Unknown provider.*openai,anthropic,gemini,local/);
});

test('keeps generated provider artifacts aligned with the selected subset', () => {
  const files = new Map(createFiles({ dir: '.', name: 'Gemini App', preset: 'expo', providers: ['gemini'], force: false })
    .map((file) => [file.path, file.content]));

  assert.match(files.get('.env.example') ?? '', /EXPO_PUBLIC_AI_PROVIDER=gemini/);
  assert.doesNotMatch(files.get('.env.example') ?? '', /OPENAI|ANTHROPIC/);
  assert.match(files.get('nativepilot.config.ts') ?? '', /providers: \["gemini"\]/);
  assert.match(files.get('src/ai/providers.ts') ?? '', /enabledProviders = \["gemini"\]/);
  assert.match(files.get('src/ai/providers.ts') ?? '', /\|\| 'gemini'/);
  assert.doesNotMatch(files.get('src/ai/providers.ts') ?? '', /OPENAI|ANTHROPIC/);
  assert.deepEqual(JSON.parse(files.get('nativepilot.manifest.json') ?? '{}').providers, ['gemini']);
  assert.match(files.get('docs/SECURITY_MODEL.md') ?? '', /Gemini \(gemini\)/);
  assert.doesNotMatch(files.get('docs/SECURITY_MODEL.md') ?? '', /OpenAI|Anthropic|Local\/proxy/);
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
    'react-native': '0.86.3',
    'react-native-reanimated': '4.5.1',
    'react-native-worklets': '0.10.1'
  });
});

test('installs the CLI used by generated verification scripts', () => {
  const files = new Map(createFiles({ dir: '.', name: 'Verified App', preset: 'expo', providers: ['local'], force: false })
    .map((file) => [file.path, file.content]));
  const pkg = JSON.parse(files.get('package.json') ?? '{}');

  assert.equal(pkg.devDependencies.nativepilot, '^0.1.0');
  assert.equal(pkg.scripts['nativepilot:doctor'], 'nativepilot doctor .');
  assert.match(files.get('README.md') ?? '', /npm install[\s\S]*npm run nativepilot:doctor/);
  assert.doesNotMatch(files.get('README.md') ?? '', /`nativepilot doctor \.`/);
});
