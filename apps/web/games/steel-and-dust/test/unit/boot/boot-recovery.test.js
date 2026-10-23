import { describe, expect, it } from 'vitest';
import { watchBoot } from '../../../src/boot/boot-recovery.js';

function fakeWindow(href) {
  const listeners = new Map();
  const window = {
    replaced: [],
    rewritten: [],
    location: {
      href,
      replace: (url) => window.replaced.push(url),
    },
    history: {
      state: { kept: true },
      replaceState: (state, title, url) => {
        window.rewritten.push({ state, url });
        window.location.href = url;
      },
    },
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type, listener) => {
      if (listeners.get(type) === listener) {
        listeners.delete(type);
      }
    },
    fire: (type) => listeners.get(type)?.(),
  };
  return window;
}

const GAME = 'https://example.com/games/steel-and-dust/';

describe('watchBoot', () => {
  it('reloads once under a fresh address when the game fails to load', () => {
    const window = fakeWindow(`${GAME}?hero=moss`);
    watchBoot(window);
    window.fire('error');
    expect(window.replaced).toHaveLength(1);
    const retry = new URL(window.replaced[0]);
    expect(retry.pathname).toBe('/games/steel-and-dust/');
    expect(retry.searchParams.get('hero')).toBe('moss');
    expect(retry.searchParams.get('fresh')).toMatch(/^\d+$/);
  });

  it('does not reload again from the retry itself, so a real bug cannot loop', () => {
    const window = fakeWindow(`${GAME}?fresh=123`);
    watchBoot(window);
    window.fire('error');
    window.fire('error');
    expect(window.replaced).toEqual([]);
  });

  it('stops watching once the game has started and tidies the fresh mark away', () => {
    const window = fakeWindow(`${GAME}?fresh=123&hero=moss`);
    watchBoot(window).started();
    window.fire('error');
    expect(window.replaced).toEqual([]);
    expect(window.rewritten).toEqual([{ state: { kept: true }, url: `${GAME}?hero=moss` }]);
  });

  it('leaves a plain address alone when the game starts', () => {
    const window = fakeWindow(GAME);
    watchBoot(window).started();
    expect(window.rewritten).toEqual([]);
  });
});
