import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type NativePilotManifest = {
  generator?: unknown;
  preset?: unknown;
  demoState?: unknown;
  managedPaths?: unknown;
  [key: string]: unknown;
};

export type ManifestReadResult =
  | { ok: true; manifest: NativePilotManifest }
  | { ok: false; error: string };

export async function readManifest(root: string): Promise<ManifestReadResult> {
  const file = path.join(root, 'nativepilot.manifest.json');
  let text: string;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    return { ok: false, error: `Unable to read nativepilot.manifest.json: ${errorMessage(error)}` };
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: `Malformed JSON in nativepilot.manifest.json: ${errorMessage(error)}` };
  }
  if (!isRecord(value)) {
    return { ok: false, error: 'nativepilot.manifest.json must contain a JSON object.' };
  }
  return { ok: true, manifest: value };
}

export function manifestShapeErrors(manifest: NativePilotManifest): string[] {
  const errors: string[] = [];
  if (typeof manifest.generator !== 'string') errors.push('generator must be a string');
  if (typeof manifest.preset !== 'string') errors.push('preset must be a string');
  if (typeof manifest.demoState !== 'string') errors.push('demoState must be a string');
  if (!Array.isArray(manifest.managedPaths) || !manifest.managedPaths.every((entry) => typeof entry === 'string')) {
    errors.push('managedPaths must be an array of strings');
  }
  return errors;
}

function isRecord(value: unknown): value is NativePilotManifest {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
