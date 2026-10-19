import { execFile } from 'node:child_process';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../src/paths.js';
import { buildSite } from '../../src/static-site/build-site.js';
import { startTestServer } from '../support/test-server.js';

const repoRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const run = promisify(execFile);
const exists = (filePath) =>
  access(filePath).then(
    () => true,
    () => false,
  );

let tempRoot;
let outDir;

beforeAll(async () => {
  tempRoot = await mkdtemp(path.join(os.tmpdir(), 'arcade-build-'));
  outDir = path.join(tempRoot, 'dist');
  await run(process.execPath, ['scripts/build-site.js', outDir], { cwd: repoRoot });
});

afterAll(() => rm(tempRoot, { recursive: true, force: true }));

describe('npm run build', () => {
  it.each([
    'index.html',
    'src/home/main.js',
    'src/home/home.css',
    'src/design/tokens.css',
    'games/steel-and-dust/game.json',
    'games/steel-and-dust/assets/icons/icon-512.png',
    'api/games',
  ])('writes %s', async (relativePath) => {
    expect(await exists(path.join(outDir, relativePath))).toBe(true);
  });

  it.each(['test', 'package.json', 'games/steel-and-dust/test', 'api/games.json'])(
    'leaves out %s',
    async (relativePath) => {
      expect(await exists(path.join(outDir, relativePath))).toBe(false);
    },
  );

  it('writes api/games byte for byte as the API serves it', async () => {
    const server = await startTestServer();
    try {
      const served = await (await fetch(`${server.baseUrl}/api/games`)).text();
      expect(await readFile(path.join(outDir, 'api', 'games'), 'utf8')).toBe(served);
    } finally {
      await server.close();
    }
  });

  it('ships every cover the catalog points at', async () => {
    const { games } = JSON.parse(await readFile(path.join(outDir, 'api', 'games'), 'utf8'));
    expect(games.length).toBeGreaterThan(0);
    for (const game of games) {
      expect(await exists(path.join(outDir, game.cover)), game.cover).toBe(true);
    }
  });

  it('refuses an output folder that overlaps the web root', async () => {
    await expect(buildSite({ outDir: WEB_ROOT })).rejects.toThrow(/must not overlap/);
    await expect(buildSite({ outDir: path.dirname(WEB_ROOT) })).rejects.toThrow(/must not overlap/);
    await expect(buildSite({ outDir: path.join(WEB_ROOT, 'dist') })).rejects.toThrow(
      /must not overlap/,
    );
  });
});
