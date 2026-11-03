import { describe, expect, it } from 'vitest';
import {
  clamp,
  directionTo,
  distance,
  dot,
  lerp,
  normalized,
  segmentGap,
  ZERO,
} from '../../../src/sim/vector.js';

describe('vector helpers', () => {
  it('measures the gap between two points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('turns a direction into one of length 1, and nothing into nothing', () => {
    expect(normalized(0, -8)).toEqual({ x: 0, y: -1 });
    expect(normalized(0, 0)).toBe(ZERO);
  });

  it('points from one point to another', () => {
    const direction = directionTo({ x: 1, y: 1 }, { x: 4, y: 5 });

    expect(direction.x).toBeCloseTo(0.6);
    expect(direction.y).toBeCloseTo(0.8);
    expect(dot(direction, direction)).toBeCloseTo(1);
  });

  it('keeps a value between two bounds', () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(4, 0, 10)).toBe(4);
  });

  it('reads between two values', () => {
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });

  it('measures how far a point lies off a segment, and where along it', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 100, y: 0 };

    expect(segmentGap(from, to, { x: 30, y: 8 })).toEqual({ gap: 8, along: 0.3 });
    expect(segmentGap(from, to, { x: -30, y: 40 })).toEqual({ gap: 50, along: 0 });
    expect(segmentGap(from, from, { x: 3, y: 4 })).toEqual({ gap: 5, along: 0 });
  });
});
