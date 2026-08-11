import path from 'node:path';
import { pathExists, readTextIfExists, removeIfExists, writeProjectFile } from './fsx.js';
import { manifestShapeErrors, readManifest } from './manifest.js';

export async function cleanDemo(rootInput: string): Promise<{ root: string; removed: string[]; preserved: string[] }> {
  const root = path.resolve(rootInput);
  const manifestResult = await readManifest(root);
  if (!manifestResult.ok) throw new Error(manifestResult.error);
  const { manifest } = manifestResult;
  const shapeErrors = manifestShapeErrors(manifest);
  if (shapeErrors.length > 0) throw new Error(`Invalid nativepilot.manifest.json: ${shapeErrors.join('; ')}.`);
  if (manifest.generator !== 'nativepilot' || manifest.preset !== 'expo') {
    throw new Error('clean-demo requires a nativepilot-generated Expo project.');
  }
  if (!['installed', 'removed'].includes(manifest.demoState as string)) {
    throw new Error('clean-demo requires manifest demoState to be "installed" or "removed".');
  }
  for (const required of ['app/index.tsx', 'src/ai', 'src/theme']) {
    if (!(await pathExists(path.join(root, required)))) throw new Error(`clean-demo requires project path: ${required}`);
  }
  const index = await readTextIfExists(path.join(root, 'app/index.tsx'));
  if (index === undefined) throw new Error('clean-demo requires a readable file: app/index.tsx');

  const removed: string[] = [];
  for (const target of ['app/chat.tsx', 'src/demo']) {
    if (await removeIfExists(path.join(root, target))) removed.push(target);
  }
  if (index?.includes('Open AI chat demo')) {
    await writeProjectFile(root, 'app/index.tsx', `import { Text, View } from 'react-native';\nimport { tokens } from '@/theme/tokens';\n\nexport default function Home() {\n  return <View style={{ flex: 1, gap: 16, padding: 24, backgroundColor: tokens.colors.background }}>\n    <Text style={{ color: tokens.colors.text, fontSize: 28, fontWeight: '700' }}>NativePilot app</Text>\n    <Text style={{ color: tokens.colors.muted }}>Demo screens were removed. AI, theme, navigation, and agent guidance boundaries are preserved.</Text>\n  </View>;\n}\n`);
  }
  await writeProjectFile(root, 'docs/DEMO_REMOVED.md', '# Demo removed\n\nThe showcase chat screen was removed with `nativepilot clean-demo`. Core AI hooks, provider configuration, theme tokens, navigation constants, and guidance files remain available.\n');
  manifest.demoState = 'removed';
  await writeProjectFile(root, 'nativepilot.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  return { root, removed: removed.sort(), preserved: ['src/ai', 'src/theme', 'src/navigation', 'AGENTS.md', 'docs/SECURITY_MODEL.md'] };
}
