import path from 'node:path';
import { readTextIfExists } from './fsx.js';

export async function printAgentBrief(rootInput: string, target = 'codex'): Promise<string> {
  const root = path.resolve(rootInput);
  const packageJson = await readTextIfExists(path.join(root, 'package.json'));
  const name = packageJson ? JSON.parse(packageJson).name ?? path.basename(root) : path.basename(root);
  return `# NativePilot agent brief (${target})\n\nProject: ${name}\nRoot: ${root}\n\n## Read first\n- AGENTS.md\n- docs/ARCHITECTURE.md\n- docs/SECURITY_MODEL.md\n\n## Boundaries\n- Screens use hooks; hooks use src/ai/client.ts.\n- Do not inline provider keys or commit real .env files.\n- Production LLM traffic belongs behind a server/proxy.\n- If you remove the showcase, use nativepilot clean-demo so core wiring survives.\n\n## Verification\n- npm test\n- nativepilot doctor . --fail-on unsafe-key,stale-guidance\n`;
}
