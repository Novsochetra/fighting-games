import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const demoEntry = {
  id: 'demo',
  title: 'Demo',
  tagline: 'Fixture game',
  description: 'A game folder made by the tests.',
  genre: 'Test',
  players: '1 player',
  cover: 'cover.png',
};

const FILES = {
  'index.html': '<!doctype html><title>Home</title>',
  'games/demo/index.html': '<!doctype html><title>Demo game</title>',
  'games/demo/game.json': JSON.stringify(demoEntry),
  'games/demo/cover.png': 'not really a png',
  'games/demo/test/unit/demo.test.js': 'secret test',
  'games/empty/notes.txt': 'a folder without index.html or game.json',
  'games/broken/game.json': '{ "id": "broken", ',
  'package.json': '{ "private": true }',
  '.env': 'SECRET=1',
};

export async function createFixtureSite() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'arcade-site-'));
  for (const [relativePath, contents] of Object.entries(FILES)) {
    const filePath = path.join(root, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents);
  }
  return {
    webRoot: root,
    gamesRoot: path.join(root, 'games'),
    remove: () => rm(root, { recursive: true, force: true }),
  };
}
