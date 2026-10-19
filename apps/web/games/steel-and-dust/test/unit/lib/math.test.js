import { describe, expect, it } from 'vitest';
import {
  clamp,
  createRng,
  directionOf,
  easeInOutCubic,
  easeOutCubic,
  hashInt,
  randomBetween,
} from '../../../src/lib/math.js';

describe('math helpers', () => {
  it('clamps into a range and keeps values inside it', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(4, 0, 10)).toBe(4);
  });

  it('eases from 0 to 1', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
  });

  it('hashes the same input to the same unsigned value', () => {
    expect(hashInt(42)).toBe(hashInt(42));
    expect(hashInt(42)).not.toBe(hashInt(43));
    expect(hashInt(-7)).toBeGreaterThanOrEqual(0);
  });

  it('replays the same random sequence for the same seed', () => {
    const first = createRng(11);
    const second = createRng(11);
    const values = Array.from({ length: 5 }, () => first());
    expect(values).toEqual(Array.from({ length: 5 }, () => second()));
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it('draws between two bounds', () => {
    for (let i = 0; i < 20; i++) {
      const value = randomBetween(3, 4);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThan(4);
    }
  });

  it('points from one x to another', () => {
    expect(directionOf(10, 20)).toBe(1);
    expect(directionOf(20, 10)).toBe(-1);
  });
});
