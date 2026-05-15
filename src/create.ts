import path from 'node:path';
import { assertWritableNewProject, writeProjectFile } from './fsx.js';
import { createFiles, normalizeAppName, parseProviders, projectDirFrom } from './templates.js';
import type { CreateOptions } from './types.js';

export type RawCreateOptions = { dir?: string; preset?: string; providers?: string; force?: boolean };

export async function createProject(appName: string, raw: RawCreateOptions = {}): Promise<{ root: string; files: string[] }> {
  if (raw.preset && raw.preset !== 'expo') throw new Error('V1 only supports --preset expo.');
  const name = normalizeAppName(appName);
  const root = raw.dir ? path.resolve(raw.dir) : projectDirFrom(process.cwd(), name);
  const options: CreateOptions = { dir: root, name, preset: 'expo', providers: parseProviders(raw.providers), force: Boolean(raw.force) };
  await assertWritableNewProject(root, options.force);
  const files = createFiles(options);
  for (const item of files) await writeProjectFile(root, item.path, item.content, item.executable);
  return { root, files: files.map((item) => item.path).sort() };
}
