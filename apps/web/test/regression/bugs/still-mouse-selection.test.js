// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  bootWithGames,
  cards,
  press,
  spotlightTitle,
  stopHomes,
  tiles,
} from '../../support/home-harness.js';

// Bug: with the mouse resting over the games, moving the selection with the keys scrolled another
// game under the pointer, the browser reported the pointer as over it, and the selection jumped
// there, so Enter opened a game the player had not picked. Only a click or a key moves the selection
// now; a pointer passing over a card or a tile never does.
const pointer = (type, target, { x, y }) =>
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y }));

beforeEach(async () => {
  document.body.innerHTML = '';
});

afterEach(stopHomes);

describe('keys and a still mouse', () => {
  it('keeps the keyboard selection when the page scrolls under a still mouse', async () => {
    const { navigate } = await bootWithGames(['alpha', 'bravo', 'charlie']);
    pointer('pointermove', tiles()[0], { x: 40, y: 40 });
    press('ArrowRight');
    press('ArrowRight');
    expect(spotlightTitle()).toBe('charlie');

    pointer('pointermove', tiles()[0], { x: 40, y: 40 });
    pointer('pointerover', tiles()[0], { x: 40, y: 40 });
    pointer('pointerover', cards()[1], { x: 44, y: 40 });
    expect(spotlightTitle()).toBe('charlie');
    press('Enter');
    expect(navigate).toHaveBeenCalledWith('games/charlie/');
  });
});
