import { describe, expect, it } from 'vitest';
import { chance, createRandom, nextRandom, wobble } from '../../../src/sim/random.js';

const draws = (seed, count) => {
  const random = createRandom(seed);

  return Array.from({ length: count }, () => nextRandom(random));
};

describe('the match random', () => {
  it('gives the same numbers for the same seed', () => {
    expect(draws(42, 20)).toEqual(draws(42, 20));
  });

  it('gives other numbers for another seed', () => {
    expect(draws(42, 5)).not.toEqual(draws(43, 5));
  });

  it('stays at 0 or above and under 1', () => {
    for (const value of draws(7, 2000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('comes true about as often as the odds say', () => {
    const random = createRandom(3);
    const hits = Array.from({ length: 4000 }, () => chance(random, 0.25)).filter(Boolean).length;

    expect(hits / 4000).toBeCloseTo(0.25, 1);
  });

  it('wobbles either way within its spread, more often near the middle', () => {
    const random = createRandom(5);
    const values = Array.from({ length: 4000 }, () => wobble(random, 10));
    const near = values.filter((value) => Math.abs(value) < 5).length;

    expect(Math.max(...values.map(Math.abs))).toBeLessThan(10);
    expect(near / values.length).toBeGreaterThan(0.6);
  });
});
