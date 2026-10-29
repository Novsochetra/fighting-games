import { describe, expect, it } from 'vitest';
import { isServedAsIs, isServedAsIsInDev } from '../../src/as-is-files.js';

describe('isServedAsIs', () => {
  it('takes the games, the art and the files asked for by name past Vite', () => {
    expect(isServedAsIs('/games/steel-and-dust/')).toBe(true);
    expect(isServedAsIs('/assets/icons/icon-192.png')).toBe(true);
    expect(isServedAsIs('/robots.txt')).toBe(true);
    expect(isServedAsIs('/src/home/appearance-early.js')).toBe(true);
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
