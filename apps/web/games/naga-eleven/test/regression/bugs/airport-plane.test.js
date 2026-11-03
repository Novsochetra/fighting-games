import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AIRPORT_ART } from '../../../src/art/backdrops/city.js';
import { VIEW } from '../../../src/config.js';
import { drawBackdrop, setBackdropCanvasFactory } from '../../../src/render/backdrops/index.js';
import { SIDES } from '../../../src/story/stage.js';
import { sceneLayout } from '../../../src/render/dialogue/layout.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';

// At the airport the plane's red tail fin stood right on Neary's bun in the right-hand portrait,
// as if it grew out of her head

const PLANE = new Set([...AIRPORT_ART.plane, ...AIRPORT_ART.stripe]);

const hexAt = (canvas, x, y) => {
  const at = (y * canvas.width + x) * 4;

  return `#${[...canvas.data.subarray(at, at + 3)].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
};

function planePixelsIn(canvas, { x, y, size }) {
  let found = 0;

  for (let row = y; row < y + size; row += 1) {
    for (let column = x; column < x + size; column += 1) {
      found += PLANE.has(hexAt(canvas, column, row)) ? 1 : 0;
    }
  }

  return found;
}

describe('the airport', () => {
  beforeEach(() => setBackdropCanvasFactory(null));
  afterEach(() => setBackdropCanvasFactory(null));

  it('keeps its plane out of both portraits', () => {
    const canvas = createPixelCanvas(VIEW.width, VIEW.height);

    drawBackdrop(canvas.getContext('2d'), 'airport', { tick: 0 });

    expect(planePixelsIn(canvas, { x: 0, y: 0, size: VIEW.width })).toBeGreaterThan(500);

    for (const side of SIDES) {
      expect(planePixelsIn(canvas, sceneLayout(side).portrait), side).toBe(0);
    }
  });
});
