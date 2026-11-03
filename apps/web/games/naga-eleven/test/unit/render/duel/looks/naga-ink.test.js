import { describe, expect, it } from 'vitest';

import { DUEL_INK } from '../../../../../src/art/duel/palette.js';
import { drawInked } from '../../../../../src/render/duel/looks/naga-ink.js';
import { rimmed } from '../../../../../src/render/duel/looks/naga-shape.js';
import { createPen } from '../../../../../src/render/duel/pen.js';
import { createPixelCanvas } from '../../../../support/pixel-canvas.js';

const LIT = '#ffeeaa';
const SHADE = '#aa6622';

function drawn(parts) {
  const canvas = createPixelCanvas(20, 20);

  drawInked(createPen(canvas.getContext('2d'), { unit: 1 }), parts);

  return (x, y) => {
    const at = (y * canvas.width + x) * 4;

    if (canvas.data[at + 3] === 0) {
      return null;
    }

    return `#${[...canvas.data.subarray(at, at + 3)].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
  };
}

const square = (color) => ({
  kind: 'poly',
  points: [
    [5, 5],
    [10, 5],
    [10, 10],
    [5, 10],
  ],
  color,
  ink: true,
});

describe('drawing a figure ringed in ink', () => {
  it('rings an inked part in one pixel of ink on every side and paints it within', () => {
    const at = drawn([square(LIT)]);

    expect([at(4, 7), at(10, 7), at(7, 4), at(7, 10)]).toEqual([
      DUEL_INK,
      DUEL_INK,
      DUEL_INK,
      DUEL_INK,
    ]);
    expect(at(7, 7)).toBe(LIT);
    expect([at(3, 7), at(11, 7), at(4, 4)]).toEqual([null, null, null]);
  });

  it('lights a rimmed part along its top and left and rings its darker copy too', () => {
    const at = drawn(rimmed([square(LIT)], SHADE));

    expect([at(5, 7), at(7, 5)]).toEqual([LIT, LIT]);
    expect([at(7, 7), at(10, 10)]).toEqual([SHADE, SHADE]);
    expect([at(11, 8), at(8, 11), at(4, 7), at(7, 4)]).toEqual([
      DUEL_INK,
      DUEL_INK,
      DUEL_INK,
      DUEL_INK,
    ]);
  });

  it('rings round parts by growing them', () => {
    const at = drawn([{ kind: 'disc', x: 10, y: 10, radius: 3, color: LIT, ink: true }]);

    expect(at(10, 10)).toBe(LIT);
    expect(at(10, 6)).toBe(DUEL_INK);
    expect(at(10, 3)).toBe(null);
  });
});
