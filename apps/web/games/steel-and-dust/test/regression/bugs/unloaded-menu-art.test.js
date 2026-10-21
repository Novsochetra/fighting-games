// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { bootArt } from '../../../src/ui/loading/boot-art.js';
import { LOADER_TIMING } from '../../../src/ui/loading/loader-gate.js';
import { openBootPage, settle } from '../../support/boot-page.js';
import { openMenu, openPage } from '../../support/menu-page.js';

// Bug: on a slow connection the title opened on black and its stone buttons popped in one by one,
// and Play, Settings or How to play could open on frames and hero strips still on their way. Nothing
// waited for the menu art: the stylesheets asked for it only once a menu was shown, at the same
// moment the game asked for every fighter's sprites.
const isUp = (loader) => !loader.classList.contains('done') && !loader.hidden;

describe('the menus before their art is in', () => {
  it('keeps the title covered while any image the menus draw is still on its way', async () => {
    const page = openBootPage();
    page.images.loadWhere((src) => !src.endsWith('kit/button.png'));
    page.boot.appReady();
    await settle();
    for (let i = 0; i < 300; i++) {
      page.frame(16);
      expect(isUp(page.loader)).toBe(true);
    }
    page.images.loadAll();
    await settle();
    page.frame(16);
    page.frame(LOADER_TIMING.lingerMs);
    expect(isUp(page.loader)).toBe(false);
  });

  it('loads every strip the hero select draws before the title comes up', () => {
    const { act } = openPage();
    act('play');
    expect(openMenu().id).toBe('m-heroes');
    const drawn = [...document.querySelectorAll('.hero-card')]
      .flatMap((card) => [...card.getAttribute('style').matchAll(/url\(([^)]+)\)/g)])
      .map(([, url]) => url.slice(url.indexOf('assets/')));
    expect(drawn).toHaveLength(14);
    expect(bootArt()).toEqual(expect.arrayContaining(drawn));
  });
});
