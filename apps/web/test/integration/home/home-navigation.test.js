// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  bootWithGames,
  gameLinks,
  loadHomeMarkup,
  press,
  selectedLink,
  stopHomes,
} from '../../support/home-harness.js';

const hrefOfSelected = () => selectedLink().getAttribute('href');

const pointer = (type, target, { x = 10, y = 10 } = {}) =>
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y }));

beforeEach(async () => {
  document.body.innerHTML = '';
  delete document.documentElement.dataset.input;
  await loadHomeMarkup();
});

afterEach(stopHomes);

describe('home page navigation with several games', () => {
  it('moves with arrows and WASD, wrapping left and right', async () => {
    await bootWithGames(['alpha', 'bravo', 'charlie']);
    press('ArrowRight');
    expect(hrefOfSelected()).toBe('games/bravo/');
    press('d');
    expect(hrefOfSelected()).toBe('games/charlie/');
    press('ArrowRight');
    expect(hrefOfSelected()).toBe('games/alpha/');
    press('a');
    expect(hrefOfSelected()).toBe('games/charlie/');
    press('w');
    expect(hrefOfSelected()).toBe('games/bravo/');
    press('ArrowDown');
    expect(hrefOfSelected()).toBe('games/charlie/');
    expect(document.activeElement).toBe(selectedLink());
    expect(gameLinks().filter((link) => link.tabIndex === 0)).toEqual([selectedLink()]);
  });

  it('opens the game that was moved to', async () => {
    const { navigate } = await bootWithGames(['alpha', 'bravo', 'charlie']);
    press('ArrowRight');
    press('Enter');
    expect(navigate).toHaveBeenCalledWith('games/bravo/');
  });

  it('selects an icon when the pointer moves over it', async () => {
    await bootWithGames(['alpha', 'bravo', 'charlie']);
    const third = gameLinks()[2];
    pointer('pointermove', third);
    pointer('pointerover', third.querySelector('.app__label'));
    expect(selectedLink()).toBe(third);
    expect(document.documentElement.dataset.input).toBe('pointer');
  });

  it('marks keyboard use, so the selected icon shows its focus ring', async () => {
    await bootWithGames(['alpha', 'bravo']);
    pointer('pointermove', document.body);
    press('ArrowRight');
    expect(document.documentElement.dataset.input).toBe('keys');
    press('Tab');
    expect(document.documentElement.dataset.input).toBe('keys');
  });
});
