#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const workflowPath = process.argv[2] ?? '.github/workflows/release.yml';
const workflow = readFileSync(workflowPath, 'utf8');

const requirements = [
  ['captures the packed filename', /id:\s*package[\s\S]*?filename=.*npm pack --silent[\s\S]*?tarball=\$filename"?\s*>>\s*"\$GITHUB_OUTPUT"/],
  ['smoke-tests the captured tarball', /scripts\/package-smoke\.sh\s+"\$\{\{\s*steps\.package\.outputs\.tarball\s*\}\}"/],
  ['publishes the captured tarball with provenance and public access', /npm publish\s+"\$\{\{\s*steps\.package\.outputs\.tarball\s*\}\}"\s+--provenance\s+--access public/],
  ['attaches the captured tarball to the GitHub release', /gh release create[\s\S]*?"\$\{\{\s*steps\.package\.outputs\.tarball\s*\}\}"/]
];

const failures = requirements
  .filter(([, pattern]) => !pattern.test(workflow))
  .map(([message]) => message);

if (failures.length > 0) {
  console.error(`Release workflow contract failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('release workflow uses one captured tarball for smoke, npm publish, and GitHub release');
