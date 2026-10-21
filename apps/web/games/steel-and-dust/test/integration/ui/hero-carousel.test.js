// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { openMenu, openPage, selected } from '../../support/menu-page.js';

const card = (hero) => document.querySelector(`.hero-card[data-hero="${hero}"]`);
const middle = () => document.querySelector('.hero-card[data-depth="0"]').dataset.hero;
const slots = () => [...document.querySelectorAll('.hero-card')].map((each) => each.dataset.slot);

function swipe(stage, from, to) {
  stage.dispatchEvent(new PointerEvent('pointerdown', { clientX: from, bubbles: true }));
  stage.dispatchEvent(new PointerEvent('pointerup', { clientX: to, bubbles: true }));
}

describe('the hero carousel on the real page', () => {
  let page;
  beforeEach(() => {
    page = openPage();
    page.act('play');
  });

  it('opens on the hero played last, in the middle, with the others round it', () => {
    expect(middle()).toBe('moss');
    expect(slots()).toEqual(['0', '1', '2', '3', '-2', '-1']);
    expect(card('bokator').dataset.depth).toBe('1');
    expect(card('blue').dataset.depth).toBe('3');
  });

  it('loops round the heroes with left and right, never landing on Back', () => {
    page.key('ArrowLeft');
    expect(middle()).toBe('bokator');
    expect(selected().dataset.hero).toBe('bokator');
    for (let step = 0; step < 6; step++) {
      page.key('ArrowRight');
    }
    expect(middle()).toBe('bokator');
    page.key('ArrowRight');
    expect(middle()).toBe('moss');
    expect(slots()).toEqual(['0', '1', '2', '-3', '-2', '-1']);
    expect(document.querySelector('.hero-card.wrap')).toBeNull();
  });

  it('goes down to Back and up again to the hero in the middle', () => {
    page.key('ArrowRight');
    page.key('ArrowDown');
    expect(selected().dataset.act).toBe('back');
    expect(middle()).toBe('firefly');
    page.key('ArrowUp');
    expect(selected().dataset.hero).toBe('firefly');
    page.key('ArrowDown');
    page.key('Enter');
    expect(openMenu().id).toBe('m-title');
  });

  it('brings a tapped side hero to the middle, and picks the hero in the middle when tapped', () => {
    card('antler').click();
    expect(middle()).toBe('antler');
    expect(page.game.mode).toBe('title');
    card('antler').click();
    expect(page.game.mode).toBe('play');
    expect(page.game.settings.hero).toBe('antler');
  });

  it('turns with the arrows on either side', () => {
    document.querySelector('[data-step="1"]').click();
    expect(middle()).toBe('firefly');
    document.querySelector('[data-step="-1"]').click();
    document.querySelector('[data-step="-1"]').click();
    expect(middle()).toBe('bokator');
    expect(page.game.mode).toBe('title');
  });

  it('turns with a swipe, and the click that ends a mouse swipe picks nothing', () => {
    const stage = document.getElementById('heroStage');
    swipe(stage, 300, 200);
    expect(middle()).toBe('firefly');
    card('firefly').click();
    expect(page.game.mode).toBe('title');
    swipe(stage, 200, 300);
    expect(middle()).toBe('moss');
    swipe(stage, 200, 210);
    card('moss').click();
    expect(page.game.mode).toBe('play');
  });

  it('stays put when the mouse passes over a side hero', () => {
    const move = new PointerEvent('pointermove', { pointerType: 'mouse', bubbles: true });
    card('firefly').dispatchEvent(move);
    expect(middle()).toBe('moss');
  });
});
