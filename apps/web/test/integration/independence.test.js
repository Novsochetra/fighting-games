import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { GAMES_ROOT, WEB_ROOT } from '../../../server/src/paths.js';

// Each game is its own app: it brings its own tokens, styles, modules and assets, and the home page
// knows a game only through its game.json. A shared file would tie every game to the arcade.
const SOURCE_FILE = /\.(js|css|html)$/;

const REFERENCE_PATTERNS = {
  '.js': /(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]/g,
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
    .filter((reference) => reference.startsWith('.') || /^[\w-]+\//.test(reference))
    .filter((reference) => !/^[a-z]+:/i.test(reference));
}

async function referencesLeaving(files, isInside) {
  const leaving = [];
  for (const file of files) {
    for (const reference of await relativeReferences(file)) {
      const target = path.resolve(path.dirname(file), reference.split(/[?#]/)[0]);
      if (!isInside(target)) {
        leaving.push(`${path.relative(WEB_ROOT, file)} -> ${reference}`);
      }
    }
  }
  return leaving;
}

const isWithin = (root) => (target) => target === root || target.startsWith(`${root}${path.sep}`);

describe('games and the home page stay independent', () => {
  it('lets each game load only files from its own folder', async () => {
    const gameIds = (await readdir(GAMES_ROOT, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name);
    expect(gameIds.length).toBeGreaterThan(0);
    for (const id of gameIds) {
      const root = path.join(GAMES_ROOT, id);
      expect(await referencesLeaving(await listFiles(root), isWithin(root))).toEqual([]);
    }
  });

  it('keeps the home and supporters pages from loading any file of a game', async () => {
    const homeFiles = [
      path.join(WEB_ROOT, 'index.html'),
      path.join(WEB_ROOT, 'supporters', 'index.html'),
      ...(await listFiles(path.join(WEB_ROOT, 'src'))),
    ];
    const isOutsideGames = (target) => !isWithin(GAMES_ROOT)(target);
    expect(await referencesLeaving(homeFiles, isOutsideGames)).toEqual([]);
  });
});
