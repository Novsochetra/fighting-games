import { describe, expect, it } from 'vitest';
import { BUTTON_SCALES } from '../../../src/data/settings.js';
import { arrangeStage } from '../../../src/ui/screen/stage-layout.js';

// Bug: on a phone half-folded on a table in a browser that cannot see the fold (Safari has no
// window.viewport), the game stood centred over the touch buttons, under a row kept for the pause
// button, and the bottom of the road ran past the fold onto the half with the buttons.

const insets = (top, bottom) => ({ top, right: 0, bottom, left: 0 });

// upright screens folded across the middle, with their status bar and home bar
const HALF_FOLDED = {
  'a flip phone with a wide inner screen': [640, 976, insets(44, 20)],
  'a Galaxy Z Flip': [412, 1004, insets(32, 0)],
};

describe('a phone half-folded where the browser cannot see the fold', () => {
  for (const [phone, [width, height, safe]] of Object.entries(HALF_FOLDED)) {
    it(`keeps the game above the fold of ${phone}, at every button size`, () => {
      for (const buttonScale of BUTTON_SCALES) {
        const screen = { width, height, safe, touch: true, buttonScale, hinge: null };
        const { rect } = arrangeStage(screen);

        expect(rect.y + rect.height).toBeLessThanOrEqual(height / 2);
      }
    });
  }
});
