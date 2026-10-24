// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bootWithGames,
  byId,
  cards,
  centerCard,
  click,
  loadHomeMarkup,
  press,
  selectedTile,
  spotlightTitle,
  stopHomes,
  tiles,
} from '../../support/home-harness.js';

const pointer = (type, target, { x, y = 100 }) =>
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 }),
  );

const activeDot = () => [...byId('pager').children].findIndex((dot) => dot.matches('.is-active'));

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('browsing the carousel', () => {
  it('moves with the arrows and A and D, looping round both ends', async () => {
    await bootWithGames(['alpha', 'bravo', 'charlie']);
    press('ArrowRight');
    expect(spotlightTitle()).toBe('bravo');
    press('d');
    expect(spotlightTitle()).toBe('charlie');
    press('ArrowRight');
    expect(spotlightTitle()).toBe('alpha');
    press('a');
    expect(spotlightTitle()).toBe('charlie');
    expect(centerCard()).toBe(cards()[2]);
    expect(activeDot()).toBe(2);
    expect(selectedTile()).toBe(tiles()[2]);
    expect(byId('play').getAttribute('href')).toBe('games/charlie/');
  });

  it('lays the cards out by their distance from the center one', async () => {
    await bootWithGames(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    const distances = cards().map((card) => card.style.getPropertyValue('--distance'));
    expect(distances).toEqual(['0', '1', '2', '3', '3', '2', '1']);
    const sides = cards().map((card) => card.style.getPropertyValue('--side'));
    expect(sides.slice(4)).toEqual(['-1', '-1', '-1']);
    expect(cards()[3].getAttribute('aria-hidden')).toBe('true');
    expect(cards()[3].classList.contains('is-hidden')).toBe(true);
  });

  it('leaves up and down to the page, which scrolls', async () => {
    await bootWithGames(['alpha', 'bravo']);
    expect(press('ArrowDown').defaultPrevented).toBe(false);
    expect(press('w').defaultPrevented).toBe(false);
    expect(spotlightTitle()).toBe('alpha');
  });

  it('keeps focus on the center card as the keys move it', async () => {
    await bootWithGames(['alpha', 'bravo', 'charlie']);
    centerCard().focus();
    press('ArrowLeft', document.activeElement);
    expect(document.activeElement).toBe(cards()[2]);
    expect(cards().filter((card) => card.tabIndex === 0)).toEqual([cards()[2]]);
  });

  it('steps with the previous and next buttons', async () => {
    await bootWithGames(['alpha', 'bravo', 'charlie']);
    click(byId('next'));
    expect(spotlightTitle()).toBe('bravo');
    click(byId('previous'));
    click(byId('previous'));
    expect(spotlightTitle()).toBe('charlie');
  });

  it('brings a side card to the center on a click, and opens it on the next', async () => {
    const { navigate } = await bootWithGames(['alpha', 'bravo', 'charlie']);
    click(cards()[1].querySelector('.card__frame'));
    expect(spotlightTitle()).toBe('bravo');
    expect(navigate).not.toHaveBeenCalled();
    click(cards()[1]);
    expect(navigate).toHaveBeenCalledWith('games/bravo/');
  });

  it('follows a sideways swipe, and the click that ends it picks nothing', async () => {
    const { navigate } = await bootWithGames(['alpha', 'bravo', 'charlie']);
    const card = cards()[0];
    pointer('pointerdown', card, { x: 300 });
    pointer('pointerup', card, { x: 200 });
    click(card);
    expect(spotlightTitle()).toBe('bravo');
    expect(navigate).not.toHaveBeenCalled();
    pointer('pointerdown', card, { x: 200 });
    pointer('pointerup', card, { x: 320 });
    expect(spotlightTitle()).toBe('alpha');
  });

  it('ignores a drag that is mostly up or down', async () => {
    await bootWithGames(['alpha', 'bravo']);
    pointer('pointerdown', cards()[0], { x: 300, y: 100 });
    pointer('pointerup', cards()[0], { x: 240, y: 300 });
    expect(spotlightTitle()).toBe('alpha');
  });

  it('moves one card per sideways trackpad swipe', async () => {
    await bootWithGames(['alpha', 'bravo', 'charlie']);
    const wheel = new WheelEvent('wheel', { deltaX: 120, deltaY: 4, cancelable: true });
    byId('carousel').dispatchEvent(wheel);
    byId('carousel').dispatchEvent(new WheelEvent('wheel', { deltaX: 120, cancelable: true }));
    expect(wheel.defaultPrevented).toBe(true);
    expect(spotlightTitle()).toBe('bravo');
  });
});

describe('picking from the library', () => {
  it('selects the tile, brings the hero back into view, and opens nothing', async () => {
    const { navigate } = await bootWithGames(['alpha', 'bravo', 'charlie']);
    const scroll = vi.fn();
    byId('hero').scrollIntoView = scroll;
    click(tiles()[2].querySelector('.tile__title'));
    expect(spotlightTitle()).toBe('charlie');
    expect(selectedTile()).toBe(tiles()[2]);
    expect(selectedTile().getAttribute('aria-current')).toBe('true');
    expect(scroll).toHaveBeenCalledWith({ block: 'start' });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('moves focus along the tiles as the keys move the selection', async () => {
    await bootWithGames(['alpha', 'bravo', 'charlie']);
    tiles()[0].focus();
    press('ArrowRight', document.activeElement);
    expect(document.activeElement).toBe(tiles()[1]);
  });
});
