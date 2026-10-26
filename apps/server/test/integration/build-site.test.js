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
    'src/arcade/main.js',
    'src/home/page.css',
    'src/home/tokens.css',
    'games/steel-and-dust/styles/tokens.css',
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

  it('ships every piece of art the catalog points at', async () => {
    const { games } = JSON.parse(await readFile(path.join(outDir, 'api', 'games'), 'utf8'));
    expect(games.length).toBeGreaterThan(0);
    const artPaths = games.flatMap((game) => [
      game.cover,
      game.banner,
      game.poster,
      game.screenshot,
    ]);
    for (const artPath of artPaths.filter(Boolean)) {
      expect(await exists(path.join(outDir, artPath)), artPath).toBe(true);
    }
  });

  // a bare import could pair a new module with an old cached one after a deploy (see
  // regression/mixed-deploy.test.js)
  it('versions every relative import in the built site', async () => {
    const bare = /(\bfrom\s*|\bimport\s*)'\.\.?\/[^']+\.js'/;
    const game = await readFile(path.join(outDir, 'games/steel-and-dust/src/main.js'), 'utf8');
    expect(game).toMatch(/from '\.\/boot\/boot-loading\.js\?v=[0-9a-f]{10}'/);
    expect(game).not.toMatch(bare);
    const page = await readFile(path.join(outDir, 'games/steel-and-dust/index.html'), 'utf8');
    expect(page).toMatch(/src="src\/main\.js\?v=[0-9a-f]{10}"/);
  });

  it('refuses an output folder that overlaps the web root', async () => {
    await expect(buildSite({ outDir: WEB_ROOT })).rejects.toThrow(/must not overlap/);
    await expect(buildSite({ outDir: path.dirname(WEB_ROOT) })).rejects.toThrow(/must not overlap/);
    await expect(buildSite({ outDir: path.join(WEB_ROOT, 'dist') })).rejects.toThrow(
      /must not overlap/,
    );
  });
});
