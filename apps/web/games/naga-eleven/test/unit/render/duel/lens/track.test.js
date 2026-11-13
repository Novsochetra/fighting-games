import { describe, expect, it } from 'vitest';

import { fullTicks, viewAt } from '../../../../../src/render/duel/lens/track.js';

const TARGETS = { middle: { x: 128, y: 72 }, face: { x: 40, y: 60 }, ball: { x: 200, y: 90 } };

const SHOTS = [
  { from: 0, on: 'middle', step: 0 },
  { from: 10, on: 'face', step: 1 },
  { from: 20, on: 'ball', step: 2, glide: 10 },
];

describe('a list of shots', () => {
  it('holds each shot until the next, cutting to it', () => {
    expect(viewAt(SHOTS, 5, TARGETS)).toEqual({ x: 128, y: 72, step: 0 });
    expect(viewAt(SHOTS, 10, TARGETS)).toEqual({ x: 40, y: 60, step: 1 });
    expect(viewAt(SHOTS, 19, TARGETS)).toEqual({ x: 40, y: 60, step: 1 });
  });

  it('glides from where the shot before looked, easing in and out, at its own step', () => {
    const start = viewAt(SHOTS, 20, TARGETS);
    const halfway = viewAt(SHOTS, 25, TARGETS);
    const end = viewAt(SHOTS, 30, TARGETS);

    expect(start).toEqual({ x: 40, y: 60, step: 2 });
    expect(halfway.x).toBeCloseTo(120);
    expect(halfway.y).toBeCloseTo(75);
    expect(end).toEqual({ x: 200, y: 90, step: 2 });
    expect(viewAt(SHOTS, 22, TARGETS).x - 40).toBeLessThan(viewAt(SHOTS, 27, TARGETS).x - 120);
  });

  it('looks at the middle for a point the stage does not name', () => {
    expect(viewAt([{ from: 0, on: 'nowhere', step: 1 }], 3, TARGETS)).toEqual({
      x: 128,
      y: 72,
      step: 1,
    });
  });

  it('runs through its shots faster for a stage played short', () => {
    expect(fullTicks(16, { length: 32, full: 64 })).toBe(32);
    expect(fullTicks(16, { length: 64, full: 64 })).toBe(16);
  });
});
