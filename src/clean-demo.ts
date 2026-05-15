import path from 'node:path';
import { readTextIfExists, removeIfExists, writeProjectFile } from './fsx.js';

export async function cleanDemo(rootInput: string): Promise<{ root: string; removed: string[]; preserved: string[] }> {
  const root = path.resolve(rootInput);
  const removed: string[] = [];
  for (const target of ['app/chat.tsx', 'src/demo']) {
    if (await removeIfExists(path.join(root, target))) removed.push(target);
  }
  const index = await readTextIfExists(path.join(root, 'app/index.tsx'));
  if (index?.includes('Open AI chat demo')) {
    await writeProjectFile(root, 'app/index.tsx', `import { Text, View } from 'react-native';\nimport { tokens } from '@/theme/tokens';\n\nexport default function Home() {\n  return <View style={{ flex: 1, gap: 16, padding: 24, backgroundColor: tokens.colors.background }}>\n    <Text style={{ color: tokens.colors.text, fontSize: 28, fontWeight: '700' }}>NativePilot app</Text>\n    <Text style={{ color: tokens.colors.muted }}>Demo screens were removed. AI, theme, navigation, and agent guidance boundaries are preserved.</Text>\n  </View>;\n}\n`);
  }
  return { root, removed: removed.sort(), preserved: ['src/ai', 'src/theme', 'src/navigation', 'AGENTS.md', 'docs/SECURITY_MODEL.md'] };
}
