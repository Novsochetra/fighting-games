// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BOOT_TIMING } from '../../../src/boot/start-loading.js';
import { LOADER_ART, SKIN_ART } from '../../../src/data/ui-art.js';
import { missionWait } from '../../../src/render/scene-loaded.js';
import { bootArt } from '../../../src/ui/loading/boot-art.js';
import { LOADER_TIMING } from '../../../src/ui/loading/loader-gate.js';
import { openBootPage, PAGE, settle } from '../../support/boot-page.js';
import { createLateView } from '../../support/late-images.js';
import { createPlayingGame } from '../../support/test-game.js';

const STYLES = join(import.meta.dirname, '../../../styles/');
const isUp = (loader) => !loader.classList.contains('done') && !loader.hidden;
const percent = (loader) =>
  loader.querySelector('[role="progressbar"]').getAttribute('aria-valuenow');

// the page's art all in or broken, the game started, and the screen faded away
async function bootThrough(page) {
  page.images.loadAll();
  page.boot.appReady();
  await settle();
  page.frame(16);
  page.frame(LOADER_TIMING.minShownMs);
  page.loader.dispatchEvent(new Event('transitionend'));
}

describe('the loading screen on the real page', () => {
  it('is up from the first paint, before any script runs, with its own art preloaded first', () => {
    const { loader } = openBootPage();
    expect(document.body.firstElementChild).toBe(loader);
    expect(isUp(loader)).toBe(true);
    expect(percent(loader)).toBe('0');
    for (const url of LOADER_ART) {
      expect(PAGE).toContain(
        `<link rel="preload" href="${url}" as="image" fetchpriority="high" />`,
      );
    }
    expect(PAGE.indexOf('src/boot/boot-loading.js')).toBeLessThan(PAGE.indexOf('src/main.js'));
  });

  it('draws only its own preloaded art, never the menu art it waits for', () => {
    const css = ['loading.css', 'loading-naga.css']
      .map((file) => readFileSync(join(STYLES, file), 'utf8'))
      .join('\n');
    const images = [...css.matchAll(/url\('([^']+)'\)/g)].map((match) => match[1].slice(3));
    expect([...new Set(images)].sort()).toEqual([...LOADER_ART].sort());
  });

  it('asks for every menu image and every hero card at once', () => {
    const { images } = openBootPage();
    expect(images.waiting()).toEqual(bootArt());
  });

  it('fills as the art comes in and lifts once all of it has settled, broken files too', async () => {
    const page = openBootPage();
    const { images, loader, frame } = page;
    images.loadWhere((src) => src.includes('assets/ui/'));
    await settle();
    expect(Number(percent(loader))).toBeGreaterThan(30);
    images.failAll();
    await settle();
    frame(16);
    expect(isUp(loader)).toBe(true);
    page.boot.appReady();
    await settle();
    frame(16);
    expect(percent(loader)).toBe('100');
    expect(loader.classList.contains('complete')).toBe(true);
    frame(LOADER_TIMING.lingerMs - 1);
    expect(loader.classList.contains('done')).toBe(false);
    frame(LOADER_TIMING.minShownMs);
    expect(loader.classList.contains('done')).toBe(true);
    loader.dispatchEvent(new Event('transitionend'));
    expect(loader.hidden).toBe(true);
  });

  it("asks for the skins' own art only once the menu art is in, and lifts without it", async () => {
    const page = openBootPage();
    await settle();
    expect(page.images.waiting().filter((src) => SKIN_ART.includes(src))).toEqual([]);
    page.images.loadAll();
    await settle();
    expect(page.images.waiting()).toEqual(SKIN_ART);
    await bootThrough({ ...page, images: { loadAll() {} } });
    expect(page.loader.hidden).toBe(true);
    expect(page.images.waiting()).toEqual(SKIN_ART);
  });

  it('never lifts before the game has built its title, however fast the art is', async () => {
    const { images, loader, frame } = openBootPage();
    images.loadAll();
    await settle();
    frame(5000);
    expect(isUp(loader)).toBe(true);
    expect(Number(percent(loader))).toBeLessThan(100);
  });

  it('starts the fighters loading once the art is in, or after a short wait if it stalls', async () => {
    const quick = openBootPage();
    let started = false;
    quick.boot.spritesMayStart.then(() => (started = true));
    quick.images.loadAll();
    await settle();
    expect(started).toBe(true);
    const stalled = openBootPage();
    stalled.boot.spritesMayStart.then((inTime) => (started = inTime));
    stalled.clock.advance(BOOT_TIMING.spritesAfterMs);
    await settle();
    expect(started).toBe(false);
  });

  it('gives up on a file that never answers, rather than holding the title forever', async () => {
    const page = openBootPage();
    page.images.loadWhere((src) => !src.includes('bg-portrait'));
    page.boot.appReady();
    await settle();
    page.frame(16);
    expect(isUp(page.loader)).toBe(true);
    page.clock.advance(BOOT_TIMING.giveUpMs);
    await settle();
    page.frame(16);
    page.frame(LOADER_TIMING.minShownMs);
    expect(page.loader.classList.contains('done')).toBe(true);
  });

  it('shows its words once the pixel font is in, or once it has waited long enough', async () => {
    const page = openBootPage();
    await settle();
    expect(page.loader.classList.contains('lettered')).toBe(true);
    const slow = openBootPage({ fontLoads: new Promise(() => {}) });
    await settle();
    expect(slow.loader.classList.contains('lettered')).toBe(false);
    slow.clock.advance(BOOT_TIMING.fontLimitMs);
    await settle();
    expect(slow.loader.classList.contains('lettered')).toBe(true);
  });
});

describe('the loading screen in play', () => {
  it('comes back over a road still loading, filling as it comes in, then goes', async () => {
    const page = openBootPage();
    await bootThrough(page);
    const game = createPlayingGame();
    const { view, images } = createLateView();
    page.frame(16, missionWait(view, game));
    expect(page.loader.hidden).toBe(true);
    page.frame(LOADER_TIMING.graceMs, missionWait(view, game));
    expect(isUp(page.loader)).toBe(true);
    expect(percent(page.loader)).toBe('0');
    images.loadWhere((src) => src.includes('backdrops/pine-ridge/'));
    page.frame(16, missionWait(view, game));
    expect(Number(percent(page.loader))).toBeGreaterThan(0);
    images.loadAll();
    page.frame(16, missionWait(view, game));
    expect(page.loader.classList.contains('complete')).toBe(true);
    page.frame(LOADER_TIMING.minShownMs, missionWait(view, game));
    expect(page.loader.classList.contains('done')).toBe(true);
  });

  it('does not flash for a road that is already in', async () => {
    const page = openBootPage();
    await bootThrough(page);
    const game = createPlayingGame();
    const { view, images } = createLateView();
    missionWait(view, game);
    images.loadAll();
    for (let i = 0; i < 30; i++) {
      page.frame(16, missionWait(view, game));
      expect(page.loader.hidden).toBe(true);
    }
  });
});
