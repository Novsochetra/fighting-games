import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ARCADE_SRC,
  GAMES_ROOT,
  PACKAGES_ROOT,
  PAGES_ROOT,
  PUBLIC_ROOT,
  WEB_ROOT,
} from '../../../../server/src/paths.js';

// Each game is its own app: it brings its own tokens, styles, modules and assets, and the home page
// knows a game only through its game.json. A shared file would tie every game to the arcade. What
// the games share (the controls, the gamepad) is a package of its own, which knows no game, and
// which the build joins into each game's bundles, so a game shipped still loads only its folder.
const SOURCE_FILE = /\.(js|ts|tsx|css|html)$/;
const MODULE_REFERENCE = /(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]/g;

const REFERENCE_PATTERNS = {
  '.js': MODULE_REFERENCE,
  '.ts': MODULE_REFERENCE,
  '.tsx': MODULE_REFERENCE,
  '.html': /\b(?:href|src)="([^"]+)"/g,
  '.css': /url\(\s*['"]?([^'")]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"]/g,
};

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    }),
  );
  return nested.flat().filter((file) => SOURCE_FILE.test(file));
}

async function relativeReferences(file) {
  const text = await readFile(file, 'utf8');
  const pattern = REFERENCE_PATTERNS[path.extname(file)];
  return [...text.matchAll(pattern)]
    .map((match) => match[1] ?? match[2])
    .filter((reference) => /^(\.|@\/|[\w-]+\/)/.test(reference))
    .filter((reference) => !/^[a-z]+:/i.test(reference));
}

// so an import through @/ cannot reach a game either
const targetOf = (file, reference) =>
  reference.startsWith('@/')
    ? path.join(ARCADE_SRC, reference.slice(2))
    : path.resolve(path.dirname(file), reference);

async function referencesLeaving(files, isInside) {
  const leaving = [];
  for (const file of files) {
    for (const reference of await relativeReferences(file)) {
      const target = targetOf(file, reference.split(/[?#]/)[0]);
      if (!isInside(target)) {
        leaving.push(`${path.relative(WEB_ROOT, file)} -> ${reference}`);
      }
    }
  }
  return leaving;
}

const isWithin = (root) => (target) => target === root || target.startsWith(`${root}${path.sep}`);

async function folderNames(root) {
  const entries = await readdir(root, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name);
}

describe('games and the home page stay independent', () => {
  it('lets each game load only files from its own folder and the shared packages', async () => {
    const gameIds = await folderNames(GAMES_ROOT);
    expect(gameIds.length).toBeGreaterThan(0);
    for (const id of gameIds) {
      const root = path.join(GAMES_ROOT, id);
      const isAllowed = (target) => isWithin(root)(target) || isWithin(PACKAGES_ROOT)(target);
      expect(await referencesLeaving(await listFiles(root), isAllowed)).toEqual([]);
    }
  });

  it('keeps every package from loading a game or the arcade, as every game may load it', async () => {
    const names = await folderNames(PACKAGES_ROOT);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const files = await listFiles(path.join(PACKAGES_ROOT, name));
      expect(await referencesLeaving(files, isWithin(PACKAGES_ROOT))).toEqual([]);
    }
  });

  it('keeps the home, leaderboard, supporters and credits pages from loading any file of a game', async () => {
    const homeFiles = [
      path.join(PAGES_ROOT, 'index.html'),
      path.join(PAGES_ROOT, 'leaderboard', 'index.html'),
      path.join(PAGES_ROOT, 'supporters', 'index.html'),
      path.join(PAGES_ROOT, 'credits', 'index.html'),
      ...(await listFiles(ARCADE_SRC)),
      ...(await listFiles(PUBLIC_ROOT)),
    ];
    const isOutsideGames = (target) => !isWithin(GAMES_ROOT)(target);
    expect(await referencesLeaving(homeFiles, isOutsideGames)).toEqual([]);
  });
});
