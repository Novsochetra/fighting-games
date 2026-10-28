import { cp, mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bundleGame, entriesOf } from '../../../build-steps/bundle-game.js';
import { offlineListOf } from '../../../../server/src/offline/game-files.js';
import { GAMES_ROOT, WEB_ROOT } from '../../../../server/src/paths.js';
import { isPublishedPath } from '../../../../server/src/public-files.js';

// Steel & Dust as the build leaves it: copied as it is, then its scripts bundled
const SOURCE = path.join(GAMES_ROOT, 'steel-and-dust');
let gameRoot = '';
let scripts = [];

const read = (file) => readFile(path.join(gameRoot, file), 'utf8');
// what a bundle imports, as from"./x.js", import"./x.js" or import("./x.js")
const importsOf = (bundle) =>
  [...bundle.matchAll(/\b(?:from|import)\s*\(?\s*"([^"]+)"/g)].map((match) => match[1]);
const exists = (file) =>
  stat(path.join(gameRoot, file)).then(
    () => true,
    () => false,
  );

beforeAll(async () => {
  gameRoot = await mkdtemp(path.join(tmpdir(), 'bundled-game-'));
  await cp(SOURCE, gameRoot, {
    recursive: true,
    filter: (source) => isPublishedPath(WEB_ROOT, source),
  });
  await bundleGame({ sourceRoot: SOURCE, gameRoot });
  scripts = entriesOf(await read('index.html'));
}, 60000);

afterAll(() => rm(gameRoot, { recursive: true, force: true }));

describe('Steel & Dust bundled by the build', () => {
  it('runs the page’s three scripts, in their order, from bundles in its own folder', async () => {
    expect(scripts.map((script) => script.replace(/-[\w-]{8}\.js$/, ''))).toEqual([
      'build/src-boot-boot-watch',
      'build/src-boot-boot-loading',
      'build/src-main',
    ]);

    for (const script of scripts) {
      expect(await exists(script)).toBe(true);
    }
  });

  it('watches the boot from a bundle that loads nothing more', async () => {
    expect(importsOf(await read(scripts[0]))).toEqual([]);
  });

  it('loads nothing but its own bundles from a bundle', async () => {
    const bundles = await readdir(path.join(gameRoot, 'build'));

    for (const bundle of bundles) {
      for (const address of importsOf(await read(`build/${bundle}`))) {
        expect(bundles).toContain(address.replace(/^\.\//, ''));
      }
    }
  });

  it('leaves the modules out, and its download goes by the bundles', async () => {
    const files = await readdir(gameRoot, { recursive: true });
    const { files: kept } = await offlineListOf(gameRoot);

    expect(files.filter((file) => file.endsWith('.js') && !file.startsWith('build'))).toEqual([]);
    expect(kept).toEqual(expect.arrayContaining(scripts));
    expect(kept.filter((file) => file.startsWith('src/'))).toEqual([]);
  });

  it('keeps every other file its page names', async () => {
    const page = await read('index.html');
    const named = [...page.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    const local = named.filter((address) => !/^(https?:|\.\.\/)/.test(address));

    for (const file of local) {
      expect(await exists(file)).toBe(true);
    }
  });
});
