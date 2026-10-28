import { describe, expect, it } from 'vitest';
import { BUTTON_SCALES } from '../../../src/data/settings.js';
import {
  arrangeStage,
  STICK_RADIUS,
  stickRestPosition,
} from '../../../src/ui/screen/stage-layout.js';

// Bug: on a phone half-folded on a table in a browser that cannot see the fold (Safari has no
// window.viewport), the game stood centred over the touch buttons, under a row kept for the pause
// button, and the bottom of the road ran past the fold onto the half with the buttons.

const insets = (top, bottom) => ({ top, right: 0, bottom, left: 0 });

// upright screens folded across the middle, with their status bar and home bar; the iPhone Duo's
// is measured from a photo of it in the seated position, by the 44 pt pause button
const HALF_FOLDED = {
  'an iPhone Duo': [643, 958, insets(85, 20)],
  'a flip phone with a wide inner screen': [640, 976, insets(44, 20)],
  'a Galaxy Z Flip': [412, 1004, insets(32, 0)],
};

function laidOut([width, height, safe], buttonScale) {
  const { rect, controlsBelow } = arrangeStage({
    width,
    height,
    safe,
    touch: true,
    buttonScale,
    hinge: null,
  });
  const stageBottom = rect.y + rect.height;
  const stick = stickRestPosition({
    zoneHeight: height,
    safe,
    stageBottom,
    controlsBelow,
    buttonScale,
  });

  return { stageBottom, stickTop: stick.y - STICK_RADIUS * buttonScale };
}

describe('a phone half-folded where the browser cannot see the fold', () => {
  for (const [phone, screen] of Object.entries(HALF_FOLDED)) {
    it(`keeps the game above the fold of ${phone} and the stick below it, at every button size`, () => {
      const fold = screen[1] / 2;

      for (const buttonScale of BUTTON_SCALES) {
        const { stageBottom, stickTop } = laidOut(screen, buttonScale);

        expect(stageBottom).toBeLessThanOrEqual(fold);
        expect(stickTop).toBeGreaterThanOrEqual(fold);
      }
    });
  }
});
