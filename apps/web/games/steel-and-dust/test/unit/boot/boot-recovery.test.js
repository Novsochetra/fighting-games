import { describe, expect, it } from 'vitest';
import { RETRY_AFTER_MS, STALL_MS, watchBoot } from '../../../src/boot/boot-recovery.js';
import { fakeBootWindow as fakeWindow } from '../../support/boot-window.js';

const GAME = 'https://example.com/games/steel-and-dust/';
const triesIn = (address) => new URL(address).searchParams.get('fresh');
// long enough for the last try's wait, well short of a stalled load
const A_FEW_SECONDS = 3 * RETRY_AFTER_MS;

describe('watchBoot', () => {
  it('reloads under a fresh address when the game fails to load', () => {
    const window = fakeWindow(`${GAME}?hero=moss`);
    watchBoot(window);
    window.fire('error');
    window.advance(RETRY_AFTER_MS);
    expect(window.replaced).toHaveLength(1);
    const retry = new URL(window.replaced[0]);
    expect(retry.pathname).toBe('/games/steel-and-dust/');
    expect(retry.searchParams.get('hero')).toBe('moss');
    expect(retry.searchParams.get('fresh')).toBe('1');
  });

  it('reloads when a module fails to come down', () => {
    const window = fakeWindow(GAME);
    watchBoot(window);
    window.fire('error', { localName: 'script' });
    window.advance(RETRY_AFTER_MS);
    expect(window.replaced).toHaveLength(1);
  });

  it('reloads once for several modules failing at once', () => {
    const window = fakeWindow(GAME);
    watchBoot(window);
    window.fire('error', { localName: 'script' });
    window.fire('error', { localName: 'script' });
    window.advance(A_FEW_SECONDS);
    expect(window.replaced).toHaveLength(1);
  });

  it('goes on without an image or a font that fails', () => {
    const window = fakeWindow(GAME);
    watchBoot(window);
    window.fire('error', { localName: 'img' });
    window.fire('error', { localName: 'link' });
    window.advance(A_FEW_SECONDS);
    expect(window.replaced).toEqual([]);
  });

  it('waits a little longer before each try', () => {
    const window = fakeWindow(`${GAME}?fresh=1`);
    watchBoot(window);
    window.fire('error');
    window.advance(2 * RETRY_AFTER_MS - 1);
    expect(window.replaced).toEqual([]);
    window.advance(1);
    expect(triesIn(window.replaced[0])).toBe('2');
  });

  it('stops after its last try, so a real bug cannot loop', () => {
    const window = fakeWindow(`${GAME}?fresh=3`);
    watchBoot(window);
    window.fire('error');
    window.advance(STALL_MS + A_FEW_SECONDS);
    expect(window.replaced).toEqual([]);
  });

  it('reloads a load that has heard of no file coming in for a while', () => {
    const window = fakeWindow(GAME);
    watchBoot(window);
    window.advance(STALL_MS - 1);
    window.fileIn();
    window.advance(STALL_MS - 1);
    expect(window.replaced).toEqual([]);
    window.advance(1 + RETRY_AFTER_MS);
    expect(triesIn(window.replaced[0])).toBe('1');
  });

  it('does not reload a game that starts while its try waits', () => {
    const window = fakeWindow(GAME);
    const watch = watchBoot(window);
    window.fire('error');
    watch.started();
    window.advance(A_FEW_SECONDS);
    expect(window.replaced).toEqual([]);
  });

  it('stops watching once the game has started and tidies the fresh mark away', () => {
    const window = fakeWindow(`${GAME}?fresh=1&hero=moss`);
    watchBoot(window).started();
    window.fire('error');
    window.advance(STALL_MS + A_FEW_SECONDS);
    expect(window.replaced).toEqual([]);
    expect(window.rewritten).toEqual([{ state: { kept: true }, url: `${GAME}?hero=moss` }]);
  });

  it('leaves a plain address alone when the game starts', () => {
    const window = fakeWindow(GAME);
    watchBoot(window).started();
    expect(window.rewritten).toEqual([]);
  });

  it('watches for errors alone where the browser cannot report files coming in', () => {
    const window = fakeWindow(GAME);
    delete window.PerformanceObserver;
    watchBoot(window);
    window.advance(STALL_MS + A_FEW_SECONDS);
    expect(window.replaced).toEqual([]);
  });
});
