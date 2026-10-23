import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { serializeCatalog } from '../catalog/build-catalog.js';
import { loadCatalog } from '../catalog/read-catalog.js';
import { GAMES_ROOT, WEB_ROOT } from '../paths.js';
import { isHiddenName } from '../public-files.js';
import { versionModules } from './version-modules.js';

export function isPublishedPath(webRoot, sourcePath) {
  const relative = path.relative(webRoot, sourcePath);
  return relative === '' || relative.split(path.sep).every(isPublishedName);
}

function isPublishedName(name) {
  return !isHiddenName(name);
}

export async function buildSite({
  outDir,
  webRoot = WEB_ROOT,
  gamesRoot = GAMES_ROOT,
  warn = console.warn,
}) {
  assertSeparateFolders(webRoot, outDir);
  await rm(outDir, { recursive: true, force: true });
  await cp(webRoot, outDir, {
    recursive: true,
    filter: (sourcePath) => isPublishedPath(webRoot, sourcePath),
  });
  await versionModules(outDir);
  const catalog = await loadCatalog({ gamesRoot, warn });
  await mkdir(path.join(outDir, 'api'), { recursive: true });
  // No extension on purpose: the page fetches the relative URL api/games on the server and on Pages.
  await writeFile(path.join(outDir, 'api', 'games'), serializeCatalog(catalog));
  return catalog;
}

// The build empties outDir first, so it must never be the web root or a folder around it.
function assertSeparateFolders(webRoot, outDir) {
  const source = path.resolve(webRoot);
  const target = path.resolve(outDir);
  if (isSameOrInside(source, target) || isSameOrInside(target, source)) {
    throw new Error(`The output folder ${target} must not overlap the web root ${source}`);
  }
}

function isSameOrInside(parent, child) {
  return child === parent || child.startsWith(`${parent}${path.sep}`);
}
