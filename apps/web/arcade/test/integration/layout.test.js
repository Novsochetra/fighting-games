import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARCADE_SRC } from '../../../../server/src/paths.js';

// The arcade's layout (CLAUDE.md, "Layout of the arcade"): a screen stands alone as a game does,
// what two screens use lives outside them, and what knows no feature leans on nothing that does.
const SOURCE_FILE = /\.(js|ts|tsx|css)$/;
const IMPORTS = /(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]/g;

async function sourceFiles() {
  const entries = await readdir(ARCADE_SRC, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && SOURCE_FILE.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

function areaOf(file) {
  const [first, second, ...rest] = path.relative(ARCADE_SRC, file).split(path.sep);

  if (first === 'screens' && rest.length > 0) {
    return `screens/${second}`;
  }

  return second === undefined ? '' : first;
}

function targetOf(file, specifier) {
  if (specifier.startsWith('@/')) {
    return path.join(ARCADE_SRC, specifier.slice(2));
  }

  return specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : null;
}

async function importsOf(file) {
  const text = await readFile(file, 'utf8');

  return [...text.matchAll(IMPORTS)].map(([, specifier]) => ({
    file,
    specifier,
    target: targetOf(file, specifier),
  }));
}

const FILES = await sourceFiles();
const IMPORTS_IN_SRC = (await Promise.all(FILES.map(importsOf))).flat();
const own = IMPORTS_IN_SRC.filter(({ target }) => target);
const named = ({ file, specifier }) => `${path.relative(ARCADE_SRC, file)} -> ${specifier}`;
const breaking = (rule) =>
  own.filter(({ file, target }) => !rule(areaOf(file), areaOf(target))).map(named);

describe('the layout of the arcade', () => {
  it('has the folders it is laid out in', async () => {
    const folders = (await readdir(ARCADE_SRC, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    expect(folders.sort()).toEqual([
      'api',
      'components',
      'hooks',
      'navigation',
      'screens',
      'service-worker',
      'services',
      'styles',
      'utils',
    ]);
  });

  it('lets no screen load another, and nothing outside screens/ load a screen', () => {
    const rule = (from, to) => !to.startsWith('screens/') || from === to || from === 'screens';

    expect(own.length).toBeGreaterThan(100);
    expect(breaking(rule)).toEqual([]);
  });

  it('keeps utils/ to plain helpers that load nothing but each other', () => {
    expect(breaking((from, to) => from !== 'utils' || to === 'utils')).toEqual([]);
  });

  it('keeps hooks/ to hooks that lean only on hooks, utils and services', () => {
    const allowed = new Set(['hooks', 'utils', 'services']);

    expect(breaking((from, to) => from !== 'hooks' || allowed.has(to))).toEqual([]);
  });

  it('keeps the service worker a program of its own, loading nothing of the app', () => {
    const rule = (from, to) => from !== 'service-worker' || to === 'service-worker';

    expect(breaking(rule)).toEqual([]);
  });

  it('reaches outside a folder through @/, never by climbing out with ../', () => {
    const climbing = IMPORTS_IN_SRC.filter(({ specifier }) => /(^|\/)\.\.\//.test(specifier));

    expect(climbing.map(named)).toEqual([]);
  });
});
