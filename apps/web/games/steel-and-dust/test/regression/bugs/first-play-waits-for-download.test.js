// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { LOADER_TIMING } from '../../../src/ui/loading/loader-gate.js';
import { openBootPage, settle } from '../../support/boot-page.js';

// Bug: for a while (ecca51a) the first play held the loading screen until the arcade had downloaded
// all of the game for offline, about 12 MB: a long wait on a phone network. A player now saves the
// game for offline from the arcade's details sheet, when they choose, and plays at once.
const isUp = (loader) => !loader.classList.contains('done') && !loader.hidden;

describe('the first play in the arcade', () => {
  it('lifts the loading screen once the menu art is in, asking nothing about offline', async () => {
    const saving = { state: 'saving', done: 1, total: 1429 };
    const fetch = vi.fn(async () => new Response(JSON.stringify(saving)));
    const page = openBootPage({ fetch });

    page.images.loadAll();
    page.boot.appReady();
    await settle();
    page.frame(16);
    page.frame(LOADER_TIMING.minShownMs);

    expect(isUp(page.loader)).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
