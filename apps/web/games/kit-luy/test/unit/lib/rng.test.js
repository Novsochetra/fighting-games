import { describe, expect, it } from 'vitest';
import { nextRandom, pick, randomInt, shuffled } from '../../../src/lib/rng.js';

const draws = (seed, count) => {
  const source = { seed };

  return Array.from({ length: count }, () => nextRandom(source));
};

describe('rng', () => {
  it('draws the same numbers again from the same seed', () => {
    expect(draws(42, 20)).toEqual(draws(42, 20));
    expect(draws(42, 20)).not.toEqual(draws(43, 20));
  });

  it('draws numbers from 0 up to but not 1', () => {
    for (const value of draws(7, 2000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('draws whole numbers across the whole range, both ends included', () => {
    const source = { seed: 3 };
    const seen = new Set(Array.from({ length: 500 }, () => randomInt(source, 2, 5)));

    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });

  it('picks only from the list', () => {
    const source = { seed: 9 };

    for (let i = 0; i < 100; i++) {
      expect(['add', 'sub']).toContain(pick(source, ['add', 'sub']));
    }
  });

  it('shuffles a copy that keeps every item', () => {
    const list = [1, 2, 3, 4, 5, 6];
    const mixed = shuffled({ seed: 5 }, list);

    expect(list).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...mixed].sort()).toEqual(list);
  });
});
