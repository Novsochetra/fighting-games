import { describe, expect, it } from 'vitest';

import { LOOK_ART } from '../../../../../src/art/duel/looks.js';
import { NAGA_MOUTH } from '../../../../../src/art/duel/naga.js';
import { DUEL_INK } from '../../../../../src/art/duel/palette.js';
import { drawNagaBody } from '../../../../../src/render/duel/looks/naga-body.js';
import { drawNagaHead } from '../../../../../src/render/duel/looks/naga-head.js';
import { createPen } from '../../../../../src/render/duel/pen.js';
import { createPixelCanvas } from '../../../../support/pixel-canvas.js';

const hexAt = (canvas, x, y) => {
  const at = (y * canvas.width + x) * 4;

  return `#${[...canvas.data.subarray(at, at + 3)].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
};

function drawn(draw) {
  const canvas = createPixelCanvas(160, 120);
  const pen = createPen(canvas.getContext('2d'), { unit: 1 });

  draw(pen);

  const colours = new Map();

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (canvas.data[(y * canvas.width + x) * 4 + 3] > 0) {
        const hex = hexAt(canvas, x, y);

        colours.set(hex, [...(colours.get(hex) ?? []), { x, y }]);
      }
    }
  }

  return colours;
}

const spanOf = (colours) => {
  const xs = [...colours.values()].flat().map(({ x }) => x);

  return { left: Math.min(...xs), right: Math.max(...xs) };
};

describe("the Naga's head", () => {
  const art = LOOK_ART.naga;

  it('is drawn in its look: a rim of light, gold edges, a red eye with a bright pupil, ivory fangs', () => {
    const colours = drawn((pen) => drawNagaHead(pen, { x: 70, y: 60, size: 2.4, art }));

    for (const colour of [
      art.body[4],
      art.body[2],
      art.accent[2],
      art.eye[1],
      art.eye[2],
      NAGA_MOUTH.fang[1],
      DUEL_INK,
    ]) {
      expect(colours.has(colour), colour).toBe(true);
    }
  });

  it('mirrors itself to face left', () => {
    const right = spanOf(drawn((pen) => drawNagaHead(pen, { x: 80, y: 60, size: 2, art })));
    const left = spanOf(
      drawn((pen) => drawNagaHead(pen, { x: 80, y: 60, size: 2, facing: -1, art })),
    );

    expect(Math.abs(80 - right.left - (left.right - 80))).toBeLessThanOrEqual(2);
    expect(Math.abs(right.right - 80 - (80 - left.left))).toBeLessThanOrEqual(2);
  });

  it('still draws its eye and gold at the smallest size the save cam gives it', () => {
    const colours = drawn((pen) => drawNagaHead(pen, { x: 40, y: 40, size: 0.9, art }));

    expect(colours.has(art.eye[1])).toBe(true);
    expect(colours.has(art.accent[2])).toBe(true);
  });
});

describe("the Naga's body", () => {
  const art = LOOK_ART.naga;
  const points = Array.from({ length: 12 }, (_, i) => ({ x: 20 + i * 10, y: 60, radius: 8 }));
  const rows = (colours, colour) => (colours.get(colour) ?? []).map(({ y }) => y);

  it('has its back on top and its gold belly under it as it swims right, and the other way left', () => {
    const swimmingRight = drawn((pen) => drawNagaBody(pen, { points, art, facing: 1 }));
    const swimmingLeft = drawn((pen) => drawNagaBody(pen, { points, art, facing: -1 }));
    const middle = (list) => list.reduce((sum, y) => sum + y, 0) / list.length;

    expect(middle(rows(swimmingRight, art.body[3]))).toBeLessThan(60);
    expect(middle(rows(swimmingRight, art.accent[2]))).toBeGreaterThan(60);
    expect(middle(rows(swimmingLeft, art.body[3]))).toBeGreaterThan(60);
    expect(middle(rows(swimmingLeft, art.accent[2]))).toBeLessThan(60);
  });

  it('has plates across its belly and is ringed in ink', () => {
    const colours = drawn((pen) => drawNagaBody(pen, { points, art, facing: 1 }));

    expect(colours.has(art.accent[1])).toBe(true);
    expect(colours.has(DUEL_INK)).toBe(true);
  });
});
