import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { clippedPen } from '../../../../src/render/duel/clip.js';
import { createPen } from '../../../../src/render/duel/pen.js';
import { camMoment } from '../../../../src/render/save-cam/moment.js';
import { camScene } from '../../../../src/render/save-cam/scene.js';
import { smoothTrail } from '../../../../src/render/save-cam/trails/path.js';
import { heads } from '../../../../src/render/save-cam/trails/seven-naga.js';
import { fakeMatch } from '../../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

// The Seven-Headed Naga is drawn on a sheet and laid down whole, its six heads behind stamped from
// drawings kept for their size: the picture is the fan drawn rect by rect straight onto the canvas
// at every tick it flies and holds, for a save and a goal. A pixel canvas stands in for the
// browser's offscreen one, so the sheet is laid down as a browser lays it
const AIMS = [
  { side: 0.5, height: 0.6 },
  { side: -0.6, height: 0.3 },
  { side: 0.05, height: 0.9 },
];

// a pen that clips draws on the canvas as it is, rect by rect: here round more than the view
const straight = (pen, options) =>
  heads(clippedPen(pen, { x: -64, y: -64, width: 384, height: 272 }), options);

const differing = (first, second) => first.filter((value, i) => value !== second[i]).length;

// one canvas pixel an art pixel; how many rects reach it
function drawn(draw, options) {
  const canvas = createPixelCanvas(256, 144);
  const context = canvas.getContext('2d');
  const calls = { fillRect: 0, drawImage: 0 };
  const counted = new Proxy(context, {
    get: (target, name) =>
      name in calls
        ? (...args) => {
            calls[name] += 1;

            return target[name](...args);
          }
        : target[name],
    set: (target, name, value) => {
      target[name] = value;

      return true;
    },
  });

  draw(createPen(counted, { unit: 1 }), options);

  return { data: canvas.data, calls };
}

function trailsOf(aim, result) {
  const moment = camMoment({ shooter: 4, keeper: 5, move: 'seven-headed-naga', aim, result }, 5);

  return Array.from({ length: 25 }, (_, i) => 12 + i * 2)
    .map((ticks) => camScene({ moment, ticks, length: 96, match: fakeMatch({ seed: 2 }) }, ticks))
    .filter((scene) => scene.trail.length >= 2)
    .map((scene) => ({ points: smoothTrail(scene.trail), art: scene.art, tick: scene.tick }));
}

beforeAll(() => {
  globalThis.OffscreenCanvas = function OffscreenCanvas(width, height) {
    return createPixelCanvas(width, height);
  };
});

afterAll(() => {
  delete globalThis.OffscreenCanvas;
});

describe('the Seven-Headed Naga laid down from a sheet', { timeout: 20000 }, () => {
  it.each(AIMS.map((aim) => [aim.side, aim.height, aim]))(
    'is the fan drawn straight, %s across and %s up',
    (_, __, aim) => {
      for (const result of ['saved', 'goal']) {
        for (const options of trailsOf(aim, result)) {
          expect(differing(drawn(heads, options).data, drawn(straight, options).data)).toBe(0);
        }
      }
    },
  );

  it('reaches the canvas in one call, not thousands of rects', () => {
    for (const options of trailsOf(AIMS[0], 'saved').slice(0, 10)) {
      expect(drawn(heads, options).calls).toEqual({ fillRect: 0, drawImage: 1 });
      expect(drawn(straight, options).calls.fillRect).toBeGreaterThan(2000);
    }
  });
});
