import { describe, expect, it } from 'vitest';

import { ART, INNER, UNIT } from '../../../../../src/render/duel/layout.js';
import {
  clampedCentre,
  lensPen,
  MIDDLE,
  MOST_STEPS,
  zoomOf,
} from '../../../../../src/render/duel/lens/lens-pen.js';
import { createPen } from '../../../../../src/render/duel/pen.js';

// a pen that notes the boxes it fills, in canvas pixels
function notingPen() {
  const boxes = [];
  const context = {
    set fillStyle(_) {},
    fillRect: (x, y, width, height) => boxes.push({ x, y, width, height }),
  };

  return { pen: createPen(context, { unit: UNIT }), boxes };
}

describe('the lens', () => {
  it('is the pen itself at step 0, so a show without a camera draws as it always did', () => {
    const { pen } = notingPen();

    expect(lensPen(pen, { x: 40, y: 40, step: 0 })).toBe(pen);
    expect(lensPen(pen, null)).toBe(pen);
  });

  it('draws every art pixel a whole number of canvas pixels square at every step', () => {
    for (let step = 1; step <= MOST_STEPS; step += 1) {
      const { pen, boxes } = notingPen();
      const lens = lensPen(pen, { x: 101.37, y: 77.9, step });

      lens.rect([10, 20, 3, 2], 'ink');

      const [box] = boxes;

      expect(lens.unit).toBe(UNIT + step);
      expect(Number.isInteger(box.x) && Number.isInteger(box.y)).toBe(true);
      expect(box.width).toBe(3 * (UNIT + step));
      expect(box.height).toBe(2 * (UNIT + step));
    }
  });

  it('puts what it looks at in the middle of the view', () => {
    const { pen, boxes } = notingPen();
    const lens = lensPen(pen, { x: 120, y: 70, step: 2 });

    lens.dot(120, 70, 'ink');

    expect(boxes[0].x).toBeCloseTo(MIDDLE.x * UNIT, -1);
    expect(boxes[0].y).toBeCloseTo(MIDDLE.y * UNIT, -1);
  });

  it('never looks past the art grid across, nor past the bars up and down', () => {
    for (let step = 1; step <= MOST_STEPS; step += 1) {
      const zoom = zoomOf({ unit: UNIT }, step);

      for (const point of [
        { x: -50, y: -50 },
        { x: 400, y: 300 },
        { x: 0, y: ART.height },
      ]) {
        const centre = clampedCentre(point, zoom);
        const halfWidth = ART.width / 2 / zoom;
        const halfHeight = (ART.height / 2 - INNER.top) / zoom;

        expect(centre.x - halfWidth).toBeGreaterThanOrEqual(0);
        expect(centre.x + halfWidth).toBeLessThanOrEqual(ART.width);
        expect(centre.y - halfHeight).toBeGreaterThanOrEqual(INNER.top);
        expect(centre.y + halfHeight).toBeLessThanOrEqual(INNER.bottom);
      }
    }
  });

  it('keeps a step past the last to the last', () => {
    const { pen } = notingPen();

    expect(lensPen(pen, { x: 128, y: 72, step: 9 }).unit).toBe(UNIT + MOST_STEPS);
  });
});
