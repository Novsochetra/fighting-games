import { describe, expect, it } from 'vitest';
import { struckAt } from '../../../src/sim/charge.js';

describe('when a kick is struck', () => {
  it('is the moment its charge began, now for one not charged', () => {
    expect(struckAt({ tick: 100 }, { charge: 30 })).toBe(70);
    expect(struckAt({ tick: 100 }, { charge: 0 })).toBe(100);
    expect(struckAt({ tick: 100 }, null)).toBe(100);
  });
});
