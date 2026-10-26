// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { BOOT_TIMING } from '../../../src/boot/start-loading.js';
import { LOADER_TIMING } from '../../../src/ui/loading/loader-gate.js';
import { fakeArcadeWorker, openBootPage, settle } from '../../support/boot-page.js';

// The loading screen on the real page, on the game's first play in the arcade, whose worker
// downloads all of the game behind it for offline.
const isUp = (loader) => !loader.classList.contains('done') && !loader.hidden;
const percent = (loader) =>
  Number(loader.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'));

async function openWithArt(answer) {
  const worker = fakeArcadeWorker(answer);
  const page = openBootPage({ fetch: worker.fetch });

  page.images.loadAll();
  page.boot.appReady();
  await settle();

  return { ...page, worker };
}

async function lifts(page) {
  page.frame(16);
  page.frame(LOADER_TIMING.minShownMs);

  return !isUp(page.loader);
}

describe('the loading screen while the arcade keeps the game', () => {
  it('fills with the download, the longer wait, once the art is in', async () => {
    const page = await openWithArt({ ready: false, done: 1, total: 4 });

    page.frame(16);

    expect(percent(page.loader)).toBe(25);
    page.worker.answer = { ready: false, done: 3, total: 4 };
    page.frame(250);
    await settle();
    page.frame(16);

    expect(percent(page.loader)).toBe(75);
  });

  it('lifts as before outside the arcade, where nothing answers', async () => {
    const page = await openWithArt(null);

    expect(await lifts(page)).toBe(true);
    expect(page.worker.asked).toBe(1);
  });

  it('lifts at once for a game already kept, and for one whose download failed', async () => {
    for (const answer of [{ ready: true }, { ready: false, failed: true }]) {
      expect(await lifts(await openWithArt(answer))).toBe(true);
    }
  });

  it('lifts once the download stops bringing files in, so a hung one never holds the game', async () => {
    const page = await openWithArt({ ready: false, done: 2, total: 4 });

    for (let waited = 0; waited < BOOT_TIMING.offlineStallMs; waited += 250) {
      page.frame(250);
      await settle();
    }

    expect(await lifts(page)).toBe(true);
  });
});
