import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { clockPlaque } from '../../../src/render/hud/clock.js';
import { SCORE_BOX } from '../../../src/render/hud/score.js';
import { pausePlace, placePause } from '../../../src/ui/screen/pause-place.js';

const rect = (x, y, width, height) => ({ x, y, width, height });
const PAUSE_SIZE = 44;

// the pause button's box on the screen, from where the screen fit places it
function pauseBox(place, width) {
  return rect(width - place.right - PAUSE_SIZE, place.top, PAUSE_SIZE, PAUSE_SIZE);
}

// a box of the HUD, drawn in the game's pixels, as it shows on the stage
function onStage(box, stage) {
  const scale = stage.width / VIEW_WIDTH;

  return rect(
    stage.x + box.x * scale,
    stage.y + box.y * scale,
    box.width * scale,
    box.height * scale,
  );
}

const apart = (one, other) =>
  one.x + one.width <= other.x || other.x + other.width <= one.x || one.y >= other.y + other.height;

function fakeApp() {
  const properties = new Map();
  const style = {
    setProperty: (name, value) => properties.set(name, value),
    removeProperty: (name) => properties.delete(name),
  };

  return { style, properties };
}

describe('the pause button', () => {
  it('keeps the corner of the screen while the touch buttons stand over the fight', () => {
    const stage = rect(77, 0, 698, 393);

    expect(pausePlace({ rect: stage, controlsBelow: false, hinge: null, width: 852 })).toBeNull();
  });

  it('keeps the corner of the bottom half of a phone folded on a table', () => {
    const hinge = { stacked: true };
    const stage = rect(159, 0, 785, 442);

    expect(pausePlace({ rect: stage, controlsBelow: true, hinge, width: 1104 })).toBeNull();
  });

  for (const [phone, stage, width] of [
    ['an iPhone SE', rect(0, 20, 375, 211), 375],
    ['a narrow Android phone', rect(0, 24, 360, 203), 360],
    ['an upright phone with a wide screen', rect(0, 44, 640, 360), 640],
    ['an unfolded Fold', rect(0, 0, 1104, 621), 1104],
    ['a Surface Duo held like a book', rect(0, 0, 540, 304), 1114],
  ]) {
    it(`stands in the HUD's top row on ${phone}, clear of the clock and the score`, () => {
      const box = pauseBox(
        pausePlace({ rect: stage, controlsBelow: true, hinge: null, width }),
        width,
      );

      expect(box.y).toBeGreaterThanOrEqual(stage.y);
      expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width);
      expect(apart(box, onStage(SCORE_BOX, stage))).toBe(true);
      expect(apart(box, onStage(clockPlaque('99:59'), stage))).toBe(true);
    });
  }

  it('centres on the HUD row where the row is taller than the button', () => {
    const stage = rect(0, 0, 1104, 621);
    const row = onStage(SCORE_BOX, stage);
    const box = pauseBox(
      pausePlace({ rect: stage, controlsBelow: true, hinge: null, width: 1104 }),
      1104,
    );

    expect(Math.abs(box.y + box.height / 2 - (row.y + row.height / 2))).toBeLessThanOrEqual(1);
  });

  it('is set on the app, and taken off for the corner', () => {
    const app = fakeApp();

    placePause(app, { top: 59, right: 99 });

    expect(Object.fromEntries(app.properties)).toEqual({
      '--pause-top': '59px',
      '--pause-right': '99px',
    });

    placePause(app, null);

    expect(app.properties.size).toBe(0);
  });
});
