import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bundleGame, entriesOf } from '../../../build-steps/bundle-game.js';
import { offlineListOf } from '../../../../../server/src/offline/game-files.js';

// a game with a page to work on it with, which shares the game's own code
const GAME = {
  'index.html': '<script type="module" src="src/main.js"></script>',
  'src/main.js': "import { score } from './score.js';\nwindow.score = score;\n",
  'src/score.js': 'export const score = () => 3;\n',
  'styles/page.css': 'body {}\n',
  'dev/lab/index.html':
    '<link rel="stylesheet" href="lab.css" />\n<script type="module" src="src/lab.js"></script>',
  'dev/lab/lab.css': 'body {}\n',
  'dev/lab/src/lab.js': "import { score } from '../../../src/score.js';\nwindow.lab = score;\n",
};

let sourceRoot = '';
let gameRoot = '';

async function writeGame(root) {
  for (const [name, body] of Object.entries(GAME)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), body);
  }
}

const read = (file) => readFile(path.join(gameRoot, file), 'utf8');

beforeAll(async () => {
  sourceRoot = await mkdtemp(path.join(tmpdir(), 'dev-page-source-'));
  gameRoot = await mkdtemp(path.join(tmpdir(), 'dev-page-build-'));
  await writeGame(sourceRoot);
  await writeGame(gameRoot);
  await bundleGame({ sourceRoot, gameRoot });
}, 60000);

afterAll(async () => {
  await rm(sourceRoot, { recursive: true, force: true });
  await rm(gameRoot, { recursive: true, force: true });
});

describe("a game's dev pages, as the build leaves them", () => {
  it('run from bundles of their own, beside them, the game bundled as before', async () => {
    const [game] = entriesOf(await read('index.html'));
    const [lab] = entriesOf(await read('dev/lab/index.html'));

    expect(game).toMatch(/^build\/src-main-[\w-]+\.js$/);
    expect(lab).toMatch(/^build\/dev-lab-src-lab-[\w-]+\.js$/);
    expect(await read(`dev/lab/${lab}`)).toContain('lab');
    expect(await readdir(path.join(gameRoot, 'build'))).toEqual([path.basename(game)]);
  });

  it("leave every module out, the game's and their own, and keep their other files", async () => {
    const files = await readdir(gameRoot, { recursive: true });

    expect(files.filter((file) => file.endsWith('.js') && !file.includes('build'))).toEqual([]);
    expect(files).toContain(path.join('dev', 'lab', 'lab.css'));
  });

  it("stay out of the game's download for offline", async () => {
    const { files } = await offlineListOf(gameRoot);

    expect(files.filter((file) => file.startsWith('dev/'))).toEqual([]);
    expect(files).toContain('index.html');
  });
});
