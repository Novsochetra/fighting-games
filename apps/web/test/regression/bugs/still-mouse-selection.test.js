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

// Bug: with the mouse resting over the games, moving the selection with the keys scrolled another
// game under the pointer, the browser reported the pointer as over it, and the selection jumped
// there, so Enter opened a game the player had not picked.
const pointer = (type, target, { x, y }) =>
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y }));

beforeEach(async () => {
  document.body.innerHTML = '';
  delete document.documentElement.dataset.input;
  await loadHomeMarkup();
});

afterEach(stopHomes);

describe('keys and a still mouse', () => {
  it('keeps the keyboard selection when the page scrolls under a still mouse', async () => {
    const { navigate } = await bootWithGames(['alpha', 'bravo', 'charlie']);
    const [first, , third] = gameLinks();
    pointer('pointermove', first, { x: 40, y: 40 });
    press('ArrowRight');
    press('ArrowRight');
    expect(selectedLink()).toBe(third);

    pointer('pointermove', first, { x: 40, y: 40 });
    pointer('pointerover', first, { x: 40, y: 40 });
    expect(selectedLink()).toBe(third);
    press('Enter');
    expect(navigate).toHaveBeenCalledWith('games/charlie/');
  });

  it('hands the selection back to the mouse once it really moves', async () => {
    await bootWithGames(['alpha', 'bravo', 'charlie']);
    const [first, second] = gameLinks();
    pointer('pointermove', first, { x: 40, y: 40 });
    press('ArrowRight');
    expect(selectedLink()).toBe(second);
    pointer('pointermove', first, { x: 44, y: 40 });
    pointer('pointerover', first, { x: 44, y: 40 });
    expect(selectedLink()).toBe(first);
  });
});
