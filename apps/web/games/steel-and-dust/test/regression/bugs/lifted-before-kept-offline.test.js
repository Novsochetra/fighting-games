// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { LOADER_TIMING } from '../../../src/ui/loading/loader-gate.js';
import { fakeArcadeWorker, openBootPage, settle } from '../../support/boot-page.js';

// Bug: the arcade downloads all of the game for offline behind its first play, but the loading
// screen lifted as soon as the menu art was in. A player who went offline before the download
// ended found the game not kept, and the arcade's "You are offline" page in its place.
const isUp = (loader) => !loader.classList.contains('done') && !loader.hidden;

describe('the first play, before the arcade has kept the game for offline', () => {
  it('keeps the loading screen up until all of the game is kept', async () => {
    const worker = fakeArcadeWorker({ ready: false, done: 1, total: 4 });
    const page = openBootPage({ fetch: worker.fetch });

    page.images.loadAll();
    page.boot.appReady();
    await settle();

    for (let i = 0; i < 100; i++) {
      worker.answer = { ready: false, done: 1 + Math.floor(i / 40), total: 4 };
      page.frame(16);
      await settle();
      expect(isUp(page.loader)).toBe(true);
    }

    worker.answer = { ready: true };
    page.frame(250);
    await settle();
    page.frame(16);
    page.frame(LOADER_TIMING.lingerMs);

    expect(isUp(page.loader)).toBe(false);
  });
});
