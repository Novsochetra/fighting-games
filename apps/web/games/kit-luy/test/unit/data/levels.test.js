import { describe, expect, it } from 'vitest';
import { RIEL } from '../../../src/data/currency.js';
import { LEVELS, levelSpec } from '../../../src/data/levels.js';

describe('levels', () => {
  it('price everything in steps a riel note can pay', () => {
    for (const { step, max, unitMax } of LEVELS) {
      expect(step % RIEL.step).toBe(0);
      expect(max % step).toBe(0);
      expect(unitMax % step).toBe(0);
      expect(max).toBeGreaterThanOrEqual(step * 2);
    }
  });

  it('never ask for a sum above the largest note', () => {
    expect(Math.max(...LEVELS.map((level) => level.max))).toBe(RIEL.notes.at(-1));
  });

  it('never shrink the prices or the times from one level to the next', () => {
    LEVELS.slice(1).forEach((level, i) => {
      expect(level.max).toBeGreaterThanOrEqual(LEVELS[i].max);
      expect(level.times[1]).toBeGreaterThanOrEqual(LEVELS[i].times[1]);
    });
  });

  it('multiply by at least two, so no sum is its own answer', () => {
    expect(LEVELS.every((level) => level.times[0] >= 2)).toBe(true);
  });

  it('give the last level to every level past it', () => {
    expect(levelSpec(1)).toBe(LEVELS[0]);
    expect(levelSpec(LEVELS.length + 9)).toBe(LEVELS.at(-1));
  });
});
