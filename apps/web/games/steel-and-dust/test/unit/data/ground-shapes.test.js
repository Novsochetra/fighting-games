import { describe, expect, it } from 'vitest';
import {
  bank,
  contour,
  ledge,
  mound,
  ramp,
  stairs,
  terrace,
} from '../../../src/data/missions/ground-shapes.js';

describe('ground shapes', () => {
  it('start and end on the road, so they chain one after another', () => {
    const shapes = [
      mound(0, 200, 20),
      bank(0, 100, 16),
      ramp(0, 120, 24),
      stairs(0, [[40, 8]]),
      terrace(0, 200, 20, 60),
      ledge(0, 200, 20, 60),
      contour(0, [
        [50, 12],
        [0, 20],
        [40, 0],
      ]),
    ];
    for (const points of shapes) {
      expect(points[0]).toEqual([0, 0]);
      expect(points.at(-1)[1]).toBe(0);
    }
  });

  it('walk a terrace up its slope and drop off its far end', () => {
    expect(terrace(10, 200, 20, 60)).toEqual([
      [10, 0],
      [70, 20],
      [200, 20],
      [200, 0],
    ]);
  });

  it('climb a ledge at its near end and walk down its far slope', () => {
    expect(ledge(10, 200, 20)).toEqual([
      [10, 0],
      [10, 20],
      [120, 20],
      [200, 0],
    ]);
  });

  it('follow a contour leg by leg, a leg of no length being a sheer step', () => {
    expect(
      contour(100, [
        [40, 12],
        [0, 20],
        [30, 20],
        [60, 0],
      ]),
    ).toEqual([
      [100, 0],
      [140, 12],
      [140, 20],
      [170, 20],
      [230, 0],
    ]);
  });
});
