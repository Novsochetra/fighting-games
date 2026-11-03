import { describe, expect, it } from 'vitest';

import { SAVE_CAM_ART } from '../../../src/art/save-cam.js';
import { ART, INNER, UNIT } from '../../../src/render/duel/layout.js';
import { createPen } from '../../../src/render/duel/pen.js';
import { drawBackdrop } from '../../../src/render/save-cam/backdrop.js';
import { FRAME } from '../../../src/render/save-cam/view.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { drawnSaveCam } from '../../support/save-cam-pixels.js';

// The focus lines were the move's palest light laid half see-through over every venue: on the
// bright morning skies of the village field, the provincial ground and the national stadium they
// all but vanished into the blue, and over the World Stadium's dark stand they were grey streaks,
// the stand lightened rather than tinted in the move's colour. Over a bright sky they are the
// move's light now, stronger; over a night stand that light toward its palest, in its colour
const SHOTS = ['power-shot', 'naga-shot', 'seven-headed-naga'];

// the view left of the goal, and the sky over the left of the bar, which the ball, its beast, the
// keeper and the goal never cross
const LEFT = { width: FRAME.left - 8, top: INNER.top, bottom: FRAME.line };
const SKY = { width: 90, top: INNER.top, bottom: FRAME.bar - 6 };

const channelsAt = (canvas, x, y) => {
  const at = ((y * UNIT + 1) * canvas.width + x * UNIT + 1) * 4;

  return [...canvas.data.subarray(at, at + 3)];
};

const hexOf = (channels) =>
  `#${channels.map((value) => value.toString(16).padStart(2, '0')).join('')}`;

function backdropAt(venue, ticks) {
  const canvas = createPixelCanvas(ART.width * UNIT, ART.height * UNIT);

  drawBackdrop(createPen(canvas.getContext('2d'), { unit: UNIT }), { tick: ticks, ticks, venue });

  return canvas;
}

// each art pixel of `area` a line lies on: the venue's colour there and the line's
function linePixels({ venue, move, ticks }, area) {
  const moment = { shooter: 4, keeper: 5, move, result: 'saved', aim: { side: 0.5, height: 0.6 } };
  const { colourAt } = drawnSaveCam(fakeMatch({ seed: 2 }), moment, { ticks, venue });
  const bare = backdropAt(venue, ticks);
  const found = [];

  for (let y = area.top; y < area.bottom; y += 1) {
    for (let x = 0; x < area.width; x += 1) {
      const under = channelsAt(bare, x, y);

      if (colourAt(x, y) !== hexOf(under)) {
        found.push({ under, line: colourAt(x, y) });
      }
    }
  }

  return found;
}

const channelsOf = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

const distance = (first, second) => Math.hypot(...first.map((value, i) => value - second[i]));

const lumaOf = ([red, green, blue]) => 0.299 * red + 0.587 * green + 0.114 * blue;

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

// the lines of every shot through its flight that lie over the venue's bright parts
const brightLines = (venue) =>
  SHOTS.flatMap((move) =>
    [24, 30, 36].flatMap((ticks) =>
      [LEFT, SKY].flatMap((area) => linePixels({ venue, move, ticks }, area)),
    ),
  ).filter(({ under }) => lumaOf(under) >= 150);

describe('the save cam’s focus lines read over every venue', { timeout: 20000 }, () => {
  it.each(['village-field', 'provincial-ground', 'national-stadium'])(
    'stand well off the bright sky and roof at %s',
    (venue) => {
      const lines = brightLines(venue);

      expect(lines.length).toBeGreaterThan(20);
      expect(
        average(lines.map(({ under, line }) => distance(under, channelsOf(line)))),
      ).toBeGreaterThan(100);
    },
  );

  it('tint the World Stadium’s night stand in a Power Shot’s gold, not grey', () => {
    const night = new Set([...SAVE_CAM_ART.sky, ...SAVE_CAM_ART.stand]);
    const lines = [24, 30, 36]
      .flatMap((ticks) => linePixels({ venue: 'world-stadium', move: 'power-shot', ticks }, LEFT))
      .filter(({ under }) => night.has(hexOf(under)))
      .map(({ line }) => channelsOf(line));
    const warmth = average(lines.map(([red, , blue]) => (red - blue) / Math.max(1, red)));

    expect(lines.length).toBeGreaterThan(20);
    expect(warmth).toBeGreaterThan(0.18);
  });
});
