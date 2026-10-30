import { stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AS_IS,
  AS_IS_SOURCES,
  DEV_ONLY_AS_IS,
  isServedAsIs,
  isServedAsIsInDev,
  sourceOfAsIs,
} from '../../src/as-is-files.js';
import { GAMES_ROOT, PACKAGES_ROOT, PUBLIC_ROOT } from '../../src/paths.js';

describe('isServedAsIs', () => {
  it('takes the games, the art and the files asked for by name past Vite', () => {
    expect(isServedAsIs('/games/steel-and-dust/')).toBe(true);
    expect(isServedAsIs('/assets/icons/icon-192.png')).toBe(true);
    expect(isServedAsIs('/robots.txt')).toBe(true);
    expect(isServedAsIs('/appearance-early.js')).toBe(true);
  });

  it('leaves the pages and the modules of the arcade to Vite', () => {
    expect(isServedAsIs('/')).toBe(false);
    expect(isServedAsIs('/supporters/')).toBe(false);
    expect(isServedAsIs('/src/main.tsx')).toBe(false);
    expect(isServedAsIs('/gamesroom/')).toBe(false);
  });

  it('copies no shared package into the build, which joins them into each game', () => {
    expect(isServedAsIs('/packages/input/src/gamepad.js')).toBe(false);
  });
});

describe('isServedAsIsInDev', () => {
  it('also sends the packages the games share, which a game loads as written in dev', () => {
    expect(isServedAsIsInDev('/packages/input/src/gamepad.js')).toBe(true);
    expect(isServedAsIsInDev('/games/steel-and-dust/')).toBe(true);
  });

  it('still leaves the arcade to Vite', () => {
    expect(isServedAsIsInDev('/')).toBe(false);
    expect(isServedAsIsInDev('/packagesroom/')).toBe(false);
  });
});

describe('sourceOfAsIs', () => {
  it('finds the games and the packages beside the arcade, and its own files in public/', () => {
    expect(sourceOfAsIs('games')).toBe(GAMES_ROOT);
    expect(sourceOfAsIs('packages')).toBe(PACKAGES_ROOT);
    expect(sourceOfAsIs('assets')).toBe(path.join(PUBLIC_ROOT, 'assets'));
    expect(sourceOfAsIs('robots.txt')).toBe(path.join(PUBLIC_ROOT, 'robots.txt'));
  });

  it('names a place on disk that is there for every as-is entry', async () => {
    const entries = [...AS_IS, ...DEV_ONLY_AS_IS];

    expect([...AS_IS_SOURCES.keys()]).toEqual(entries);
    for (const entry of entries) {
      await expect(stat(sourceOfAsIs(entry))).resolves.toBeTruthy();
    }
  });
});
