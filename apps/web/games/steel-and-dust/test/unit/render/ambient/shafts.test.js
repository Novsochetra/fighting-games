import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../../src/config.js';
import { rectsOf, ticksUpTo } from './ambient-recorder.js';

const shaftAt = (x, width, extra = {}) => ({
  kind: 'shafts',
  plane: 'back',
  shafts: [{ x, width }],
  slope: 0.35,
  ...extra,
});

describe('ambient light shafts', () => {
  it('run from the top of the view down to the ground, sheared by the slope', () => {
    const rects = rectsOf(shaftAt(80, 30), { tick: 0 });
    const last = rects.at(-1);
    expect(rects[0]).toMatchObject({ x: 80, y: 0, width: 30 });
    expect(last.y + last.height).toBe(GROUND_Y);
    expect(last.x - rects[0].x).toBe(Math.round((GROUND_Y - 1) * 0.35));
    expect(rects.reduce((rows, rect) => rows + rect.height, 0)).toBe(GROUND_Y);
  });

  it('merge rows that share an offset into one rect', () => {
    expect(rectsOf(shaftAt(80, 30), { tick: 0 }).length).toBeLessThanOrEqual(
      Math.ceil(GROUND_Y * 0.35) + 1,
    );
    expect(rectsOf(shaftAt(80, 30, { slope: 0 }), { tick: 0 })).toHaveLength(1);
  });

  it('breathe slowly between alpha 0.04 and 0.10', () => {
    const alphas = ticksUpTo(1200, 20).map((tick) => rectsOf(shaftAt(80, 30), { tick })[0].alpha);
    expect(Math.min(...alphas)).toBeGreaterThanOrEqual(0.04);
    expect(Math.max(...alphas)).toBeLessThanOrEqual(0.1);
    expect(Math.max(...alphas) - Math.min(...alphas)).toBeGreaterThan(0.04);
  });

  it('move with the camera by their drift', () => {
    const drifting = shaftAt(80, 30, { drift: 0.5 });
    const shifted = rectsOf(drifting, { cameraX: 40 }).map((rect) => rect.x);
    expect(shifted).toEqual(rectsOf(drifting, { cameraX: 0 }).map((rect) => rect.x - 20));
    expect(rectsOf(shaftAt(80, 30), { cameraX: 40 })).toEqual(rectsOf(shaftAt(80, 30)));
  });

  it('are clipped at the edges of the view', () => {
    for (const x of [-20, 370]) {
      for (const rect of rectsOf(shaftAt(x, 40))) {
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(VIEW_WIDTH);
      }
    }
  });
});
