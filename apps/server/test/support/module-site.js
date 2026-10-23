import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { versionModules } from '../../src/static-site/version-modules.js';

// a folder of modules written from { 'relative/path.js': source }, versioned like the built site
export async function versionedSite(files) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'arcade-modules-'));
  for (const [relativePath, contents] of Object.entries(files)) {
    const filePath = path.join(root, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents);
  }
  await versionModules(root);
  const read = (relativePath) => readFile(path.join(root, relativePath), 'utf8');
  return { root, read, remove: () => rm(root, { recursive: true, force: true }) };
}

// the version one file gives to a module it imports, by the specifier it uses
export function versionIn(source, specifier) {
  const escaped = specifier.replace(/[.]/g, '\\.');
  const match = source.match(new RegExp(`['"]${escaped}\\?v=([0-9a-f]+)['"]`));
  return match ? match[1] : null;
}
