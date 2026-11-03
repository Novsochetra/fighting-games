import { describe, expect, it } from 'vitest';

import { LOOK_ART } from '../../../../src/art/duel/looks.js';
import { NAGA_MOUTH } from '../../../../src/art/duel/naga.js';
import { DUEL_INK } from '../../../../src/art/duel/palette.js';
import { MOVES } from '../../../../src/data/moves.js';
import { createPen } from '../../../../src/render/duel/pen.js';
import { camMoment } from '../../../../src/render/save-cam/moment.js';
import { camScene } from '../../../../src/render/save-cam/scene.js';
import { drawCamTrail } from '../../../../src/render/save-cam/trails/index.js';
import { fakeMatch } from '../../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

const NAGA_LOOKS = ['naga', 'twin-naga', 'seven-naga', 'flying-naga'];

const NAGA_MOVES = Object.values(MOVES).filter((move) => NAGA_LOOKS.includes(move.look));

// a night sky and a day one, as the save cam's venues stand behind the goal
const GROUNDS = ['#0b1028', '#c4e2f6'];

const hexAt = (canvas, x, y) => {
  const at = (y * canvas.width + x) * 4;

  return `#${[...canvas.data.subarray(at, at + 3)].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
};

// the trail alone on one ground, one canvas pixel an art pixel
function trailOn(ground, { move, ticks, side }) {
  const canvas = createPixelCanvas(256, 144);
  const pen = createPen(canvas.getContext('2d'), { unit: 1 });
  const moment = camMoment(
    { shooter: 4, keeper: 5, move: move.id, aim: { side, height: 0.5 }, result: 'saved', dive: 1 },
    5,
  );
  const scene = camScene({ moment, ticks, length: 96, match: fakeMatch({ seed: 2 }) }, 300 + ticks);

  pen.rect([0, 0, 256, 144], ground);
  drawCamTrail(pen, { points: scene.trail, look: move.look, art: scene.art, tick: scene.tick });

  return canvas;
}

// pixels of the Naga's own colours that stand straight on the ground with no ink between; the
// throat at the back of the open jaws is let be, as the ball sits in front of it
function bareEdges(canvas, ground) {
  const open = new Set([ground, DUEL_INK, NAGA_MOUTH.inside, NAGA_MOUTH.throat]);
  const bare = [];

  for (let y = 1; y < canvas.height - 1; y += 1) {
    for (let x = 1; x < canvas.width - 1; x += 1) {
      const touches = [
        hexAt(canvas, x - 1, y),
        hexAt(canvas, x + 1, y),
        hexAt(canvas, x, y - 1),
        hexAt(canvas, x, y + 1),
      ];

      if (!open.has(hexAt(canvas, x, y)) && touches.includes(ground)) {
        bare.push({ x, y });
      }
    }
  }

  return bare;
}

const coloursIn = (canvas) => {
  const found = new Set();

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      found.add(hexAt(canvas, x, y));
    }
  }

  return found;
};

describe('the Naga in the save cam', () => {
  it('rides every naga move there is', () => {
    expect(NAGA_MOVES.map((move) => move.look).sort()).toEqual([...NAGA_LOOKS].sort());
  });

  it.each(NAGA_MOVES.map((move) => [move.id, move]))(
    '%s burns its eyes and shows its gold over a dark sky and a light one',
    (id, move) => {
      for (const ground of GROUNDS) {
        for (const ticks of [16, 26, 36]) {
          const colours = coloursIn(trailOn(ground, { move, ticks, side: 0.6 }));

          expect(colours.has(LOOK_ART[move.look].eye[1]), `${id} ${ticks}`).toBe(true);
          expect(colours.has(DUEL_INK), `${id} ${ticks}`).toBe(true);
          expect(colours.has(LOOK_ART.naga.accent[2]), `${id} ${ticks}`).toBe(true);
        }
      }
    },
  );

  // Hanuman's wind about the Flying Naga is a white of its own, ringed in its own edge
  it.each(NAGA_MOVES.filter((move) => move.look !== 'flying-naga').map((move) => [move.id, move]))(
    '%s is ringed in ink wherever it meets the sky, so it reads over any venue',
    (id, move) => {
      for (const ground of GROUNDS) {
        for (const [ticks, side] of [
          [12, 0.6],
          [16, -0.2],
          [20, 0.9],
          [24, -0.7],
          [30, 0.4],
          [34, 0.1],
          [40, -0.9],
        ]) {
          expect(
            bareEdges(trailOn(ground, { move, ticks, side }), ground),
            `${ticks} ${side}`,
          ).toEqual([]);
        }
      }
    },
  );
});
