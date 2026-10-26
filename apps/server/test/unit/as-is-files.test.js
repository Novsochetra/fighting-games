import { describe, expect, it } from 'vitest';
import { isServedAsIs } from '../../src/as-is-files.js';

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
});
