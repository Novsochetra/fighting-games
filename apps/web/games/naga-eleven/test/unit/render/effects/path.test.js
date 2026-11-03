import { describe, expect, it } from 'vitest';
import { resample } from '../../../../src/render/effects/path.js';
import {
  createRing,
  clearRing,
  pushPoint,
  ringPoints,
} from '../../../../src/render/effects/ring.js';

describe('the path a trail is drawn along', () => {
  it('keeps the last places in order, oldest first, and drops the oldest on request', () => {
    const ring = createRing(3);

    for (const x of [1, 2, 3, 4]) {
      pushPoint(ring, { x, y: 0, z: -2 });
    }

    expect(ringPoints(ring).map((point) => point.x)).toEqual([2, 3, 4]);
    expect(ringPoints(ring, 1).map((point) => point.x)).toEqual([3, 4]);
    expect(ringPoints(ring)[0].z).toBe(0);

    clearRing(ring);
    expect(ringPoints(ring)).toEqual([]);
  });

  it('cuts a drawn path into even samples, tail to head, each with its way', () => {
    const { samples, step } = resample(
      [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 40, y: 40 },
      ],
      { spacing: 4 },
    );

    expect(samples[0]).toMatchObject({ x: 0, y: 0, t: 0, dx: 1, dy: 0 });
    expect(samples.at(-1)).toMatchObject({ x: 40, y: 40, t: 1, dx: 0, dy: 1 });
    expect(step).toBeCloseTo(80 / (samples.length - 1));
    expect(samples.length).toBeLessThanOrEqual(32);
  });

  it('gives no samples to a path too short to draw', () => {
    expect(resample([{ x: 3, y: 3 }]).samples).toEqual([]);
    expect(
      resample([
        { x: 3, y: 3 },
        { x: 3.5, y: 3 },
      ]).samples,
    ).toEqual([]);
  });
});
