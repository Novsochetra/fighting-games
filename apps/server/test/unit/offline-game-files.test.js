import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { offlineListOf, playedFilesOf } from '../../src/offline/game-files.js';

let gameRoot;

async function writeGame(files) {
  for (const [name, body] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(gameRoot, name)), { recursive: true });
    await writeFile(path.join(gameRoot, name), body);
  }
}

beforeEach(async () => {
  gameRoot = await mkdtemp(path.join(tmpdir(), 'arcade-game-'));
  await writeGame({
    'index.html': 'page',
    'src/main.js': 'code',
    'assets/sprites/heroes/angkor/hero_slash.png': 'whole strip',
    'assets/sprites/heroes/angkor/packed/hero_slash.png': 'packed strip',
    'assets/sprites/heroes/angkor/card_idle.png': 'card',
    'assets/screenshots/angkor-wat.png': 'shot',
    'assets/social/title-screen.jpg': 'preview',
    'assets/trailer/trailer.mp4': 'video',
    'assets/sprites/README.md': 'notes',
    'test/unit/main.test.js': 'test',
  });
});

afterEach(() => rm(gameRoot, { recursive: true, force: true }));

describe('the files a game is played with', () => {
  it('are its page, code and art, the packed strip in place of the whole one it was cut from', async () => {
    expect(await playedFilesOf(gameRoot)).toEqual([
      'assets/sprites/heroes/angkor/card_idle.png',
      'assets/sprites/heroes/angkor/packed/hero_slash.png',
      'index.html',
      'src/main.js',
    ]);
  });

  it('come with a revision that changes with any of them, and only with them', async () => {
    const before = await offlineListOf(gameRoot);

    await writeGame({ 'assets/screenshots/angkor-wat.png': 'a new shot' });
    expect((await offlineListOf(gameRoot)).revision).toBe(before.revision);

    await writeGame({ 'src/main.js': 'new code' });
    expect((await offlineListOf(gameRoot)).revision).not.toBe(before.revision);
    expect(before.revision).toMatch(/^[0-9a-f]{16}$/);
  });
});
