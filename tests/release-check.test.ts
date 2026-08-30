import test from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('fails generated-app verification on Expo dependency mismatches', () => {
  const binDir = mkdtempSync(join(tmpdir(), 'nativepilot-expo-check-'));
  try {
    const fakeNpx = join(binDir, 'npx');
    writeFileSync(fakeNpx, '#!/usr/bin/env bash\nexit 23\n');
    chmodSync(fakeNpx, 0o755);

    const result = spawnSync('bash', [join(process.cwd(), 'scripts/expo-dependency-check.sh')], {
      env: { ...process.env, PATH: `${binDir}:${process.env.PATH ?? ''}` }
    });
    assert.equal(result.status, 23);
  } finally {
    rmSync(binDir, { recursive: true, force: true });
  }
});

test('release contract rejects missing publish and repacked artifacts', () => {
  const fixtureDir = mkdtempSync(join(tmpdir(), 'nativepilot-release-contract-'));
  try {
    const fixture = join(fixtureDir, 'release.yml');
    writeFileSync(fixture, 'run: npm pack\nrun: gh release create v1 *.tgz\n');

    const result = spawnSync(process.execPath, [
      join(process.cwd(), 'scripts/release-contract-check.mjs'),
      fixture
    ], { encoding: 'utf8' });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /publishes the captured tarball/);
    assert.match(result.stderr, /attaches the captured tarball/);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});
