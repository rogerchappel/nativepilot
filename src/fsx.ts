import { constants } from 'node:fs';
import { access, chmod, lstat, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function pathExists(target: string): Promise<boolean> {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function assertWritableNewProject(root: string, force: boolean): Promise<void> {
  if (!(await pathExists(root))) return;
  const entries = await readdir(root);
  if (entries.length > 0 && !force) {
    throw new Error(`${root} already exists and is not empty. Re-run with --force to overwrite nativepilot-managed files.`);
  }
}

export async function assertProjectDestinationsWritable(root: string, relativePaths: string[]): Promise<void> {
  for (const relativePath of relativePaths) {
    const parts = relativePath.split('/');
    for (let index = 1; index <= parts.length; index += 1) {
      const target = path.join(root, ...parts.slice(0, index));
      if (!(await pathExists(target))) continue;
      const current = await lstat(target);
      const isDestination = index === parts.length;
      if (isDestination ? !current.isFile() : !current.isDirectory()) {
        throw new Error(`cannot replace non-file project path: ${relativePath}`);
      }
      await access(target, constants.W_OK);
    }
  }
}

export async function writeProjectFile(root: string, relativePath: string, content: string, executable = false): Promise<void> {
  const destination = path.join(root, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content, 'utf8');
  if (executable) await chmod(destination, 0o755);
}

export async function readTextIfExists(file: string): Promise<string | undefined> {
  if (!(await pathExists(file))) return undefined;
  const current = await stat(file);
  if (!current.isFile()) return undefined;
  return readFile(file, 'utf8');
}

export async function removeIfExists(target: string): Promise<boolean> {
  if (!(await pathExists(target))) return false;
  await rm(target, { recursive: true, force: true });
  return true;
}
