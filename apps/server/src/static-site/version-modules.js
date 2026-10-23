import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { strongComponents } from './module-graph.js';
import { relativeImports, rewriteImports, rewriteScripts } from './module-imports.js';

// Pages serves every file with a ten minute max-age and no version in its name, so after a deploy a
// browser could link a new module against an old cached copy of one it imports; the missing export
// stops the game before it starts, and the loading screen hangs at 97%. Every module URL gets a
// version from its content and its imports' versions instead: a change gives the module and
// everything above it new URLs, which no cache holds, and unchanged modules keep theirs
export async function versionModules(outDir) {
  const files = await listFiles(outDir);
  const modules = await readAll(files.filter((file) => file.endsWith('.js')));
  const versions = moduleVersions(modules, outDir);
  const versionFrom = (file) => (specifier) =>
    versions.get(path.resolve(path.dirname(file), specifier));
  for (const [file, source] of modules) {
    await writeFile(file, rewriteImports(source, versionFrom(file)));
  }
  for (const [file, html] of await readAll(files.filter((name) => name.endsWith('.html')))) {
    await writeFile(file, rewriteScripts(html, versionFrom(file)));
  }
  return versions;
}

async function listFiles(folder) {
  const entries = await readdir(folder, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

async function readAll(files) {
  return new Map(
    await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])),
  );
}

function importGraph(modules) {
  const graph = new Map();
  for (const [file, source] of modules) {
    const imported = relativeImports(source).map((specifier) =>
      path.resolve(path.dirname(file), specifier),
    );
    graph.set(
      file,
      imported.filter((dependency) => modules.has(dependency)),
    );
  }
  return graph;
}

// a cycle shares one version, hashed from all its members with their outside imports versioned
function moduleVersions(modules, outDir) {
  const versions = new Map();
  for (const component of strongComponents(importGraph(modules))) {
    const hash = createHash('sha256');
    for (const file of [...component].sort()) {
      const outside = (specifier) =>
        versions.get(path.resolve(path.dirname(file), specifier)) ?? null;
      hash.update(
        `${path.relative(outDir, file)}\n${rewriteImports(modules.get(file), outside)}\n`,
      );
    }
    const version = hash.digest('hex').slice(0, 10);
    component.forEach((file) => versions.set(file, version));
  }
  return versions;
}
