#!/usr/bin/env node
import { Command } from 'commander';
import { cleanDemo } from './clean-demo.js';
import { createProject } from './create.js';
import { doctor } from './doctor.js';
import { printAgentBrief } from './brief.js';

const program = new Command();
program.name('nativepilot').description('AI-native Expo React Native starter generator.').version('0.1.0');

program.command('create')
  .argument('<app-name>')
  .option('--dir <path>', 'Write to an explicit directory instead of ./<app-name>')
  .option('--preset <preset>', 'Starter preset. V1 supports expo.', 'expo')
  .option('--providers <list>', 'Comma-separated providers: openai,anthropic,gemini,local')
  .option('-f, --force', 'Overwrite nativepilot-managed files in a non-empty directory')
  .description('Scaffold an Expo-first AI-native React Native app.')
  .action(async (appName, options) => run(async () => {
    const result = await createProject(appName, options);
    console.log(JSON.stringify({ ok: true, command: 'create', ...result }, null, 2));
  }));

program.command('doctor')
  .argument('[root]', 'Generated app root', '.')
  .option('--fail-on <codes>', 'Comma-separated issue codes or severities to promote to errors')
  .description('Check generated project structure, guidance freshness, aliases, and unsafe key patterns.')
  .action(async (root, options) => run(async () => {
    const failOn = String(options.failOn ?? '').split(',').map((x) => x.trim()).filter(Boolean);
    const result = await doctor(root, failOn);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  }));

program.command('clean-demo')
  .argument('[root]', 'Generated app root', '.')
  .description('Remove showcase screens while preserving AI, navigation, theme, and guidance wiring.')
  .action(async (root) => run(async () => console.log(JSON.stringify({ ok: true, command: 'clean-demo', ...(await cleanDemo(root)) }, null, 2))));

program.command('print-agent-brief')
  .argument('[root]', 'Generated app root', '.')
  .option('--for <agent>', 'Target assistant', 'codex')
  .description('Print a concise handoff brief for a coding agent.')
  .action(async (root, options) => run(async () => console.log(await printAgentBrief(root, options.for))));

async function run(fn: () => Promise<void>): Promise<void> {
  try { await fn(); }
  catch (error) { console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2)); process.exitCode = 1; }
}

program.parseAsync();
