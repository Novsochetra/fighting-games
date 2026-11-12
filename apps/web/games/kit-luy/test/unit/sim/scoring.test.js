import { describe, expect, it } from 'vitest';
import { TUNING } from '../../../src/data/tuning.js';
import { accuracyOf, comboOf, gainOf, levelOf, timeGainOf } from '../../../src/sim/scoring.js';

describe('scoring', () => {
  it('starts on level 1 and climbs one every six right answers', () => {
    expect(levelOf(0)).toBe(1);
    expect(levelOf(5)).toBe(1);
    expect(levelOf(6)).toBe(2);
    expect(levelOf(17)).toBe(3);
  });

  it('multiplies the pay one more every five in a row, up to five times', () => {
    expect([0, 4, 5, 9, 10, 19, 20, 99].map(comboOf)).toEqual([1, 1, 2, 2, 3, 4, 5, 5]);
  });

  it('pays the level times the multiplier, and the level again for a fast answer', () => {
    expect(gainOf({ level: 1, streak: 1, fast: false })).toBe(100);
    expect(gainOf({ level: 1, streak: 1, fast: true })).toBe(200);
    expect(gainOf({ level: 4, streak: 12, fast: false })).toBe(1200);
    expect(gainOf({ level: 4, streak: 12, fast: true })).toBe(1600);
  });

  it('gives less time back on each level, and never less than its floor', () => {
    expect(timeGainOf(1)).toBe(TUNING.timeGainMs);
    expect(timeGainOf(2)).toBeLessThan(timeGainOf(1));
    expect(timeGainOf(60)).toBe(TUNING.minTimeGainMs);
  });

  it('counts accuracy in whole percent, and none before an answer', () => {
    expect(accuracyOf({ correct: 0, wrong: 0 })).toBe(0);
    expect(accuracyOf({ correct: 7, wrong: 6 })).toBe(54);
    expect(accuracyOf({ correct: 3, wrong: 0 })).toBe(100);
  });
});
