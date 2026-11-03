import { describe, expect, it } from 'vitest';
import { nextBanner } from '../../../../src/render/venues/shared/banner-wall.js';

const ROLLS = Array.from({ length: 200 }, (_, i) => i / 200);

describe('the banners hung along a wall', () => {
  it('never hang a banner beside its twin, the bug the provincial ground showed', () => {
    for (let last = 0; last < 4; last += 1) {
      for (const roll of ROLLS) {
        const picked = nextBanner(4, last, roll);

        expect(picked).not.toBe(last);
        expect(picked).toBeGreaterThanOrEqual(0);
        expect(picked).toBeLessThan(4);
      }
    }
  });

  it('still reach every banner, and pick freely for the first one or a wall of one', () => {
    const reached = new Set(ROLLS.map((roll) => nextBanner(4, 1, roll)));

    expect([...reached].sort()).toEqual([0, 2, 3]);
    expect(new Set(ROLLS.map((roll) => nextBanner(4, -1, roll))).size).toBe(4);
    expect(nextBanner(1, 0, 0.7)).toBe(0);
  });
});
