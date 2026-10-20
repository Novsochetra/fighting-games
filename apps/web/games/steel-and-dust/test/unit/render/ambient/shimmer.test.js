import { describe, expect, it } from 'vitest';
import { rectsOf, ticksUpTo } from './ambient-recorder.js';

const heat = {
  kind: 'shimmer',
  plane: 'back',
  emitters: [{ x: 200, y: 170 }],
  tileWidth: 1000,
  drift: 1,
  width: 40,
  height: 28,
};

const meanOf = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

describe('ambient heat shimmer', () => {
  const frames = ticksUpTo(600, 7).map((tick) => rectsOf(heat, { tick }));
  const all = frames.flat();

  it('is thin dashes of light in a band rising from the hot spot', () => {
    for (const rect of all) {
      expect(rect.height).toBe(1);
      expect(rect.width).toBeLessThanOrEqual(8);
      expect(rect.y).toBeLessThanOrEqual(170);
      expect(rect.y).toBeGreaterThanOrEqual(170 - 28);
      expect(Math.abs(rect.x + rect.width / 2 - 200)).toBeLessThan(28);
    }
  });

  it('fades out toward the top of the band', () => {
    const low = all.filter((rect) => rect.y > 170 - 8);
    const high = all.filter((rect) => rect.y < 170 - 20);
    expect(meanOf(high.map((rect) => rect.alpha))).toBeLessThan(
      meanOf(low.map((rect) => rect.alpha)) / 2,
    );
  });

  it('ripples: the dashes climb and wobble from one moment to the next', () => {
    const first = frames[0].map((rect) => `${rect.x},${rect.y}`);
    const next = rectsOf(heat, { tick: 3 }).map((rect) => `${rect.x},${rect.y}`);
    expect(next).not.toEqual(first);
  });
});
