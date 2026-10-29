import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { clockPlaque } from '../../../src/render/hud/clock.js';
import { SCORE_BOX } from '../../../src/render/hud/score.js';
import { VITALS_BOX, WEAPON_BOX } from '../../../src/render/hud/top-bar.js';
import { pausePlace, placePause } from '../../../src/ui/screen/pause-place.js';

const rect = (x, y, width, height) => ({ x, y, width, height });

// the pause button's plaque on the screen, from where the screen fit places it
function pauseBox(place, width) {
  return rect(width - place.right - place.size, place.top, place.size, place.size);
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
  const classes = new Set();
  const style = {
    setProperty: (name, value) => properties.set(name, value),
    removeProperty: (name) => properties.delete(name),
  };
  const classList = { toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)) };

  return { style, classList, properties, classes };
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

  for (const [phone, stage, width] of [
    ['an iPhone 15', rect(0, 0, 393, 221), 393],
    ['an iPhone SE', rect(0, 20, 375, 211), 375],
    ['an unfolded Fold', rect(0, 0, 1104, 621), 1104],
  ]) {
    it(`is one more plaque of the HUD's top row on ${phone}, as tall as the row`, () => {
      const score = onStage(SCORE_BOX, stage);
      const gap = (VITALS_BOX.x - WEAPON_BOX.width) * (stage.width / VIEW_WIDTH);
      const box = pauseBox(
        pausePlace({ rect: stage, controlsBelow: true, hinge: null, width }),
        width,
      );

      expect(box.y).toBe(score.y);
      expect(Math.abs(box.height - score.height)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(score.x - (box.x + box.width) - gap)).toBeLessThanOrEqual(0.5);
    });
  }

  it('is set on the app, and taken off for the corner', () => {
    const app = fakeApp();

    placePause(app, { top: 59, right: 99, size: 30, pixel: 1.5 });

    expect(Object.fromEntries(app.properties)).toEqual({
      '--pause-top': '59px',
      '--pause-right': '99px',
      '--pause-size': '30px',
      '--pause-pixel': '1.5px',
    });
    expect([...app.classes]).toEqual(['pause-in-hud']);

    placePause(app, null);

    expect(app.properties.size).toBe(0);
    expect(app.classes.size).toBe(0);
  });
});
