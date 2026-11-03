import { describe, expect, it } from 'vitest';
import { createMatch } from '../../../src/sim/create-match.js';
import {
  byStat,
  diveReachOf,
  keeperReachOf,
  shareOf,
  shotSpeedOf,
  shotSpreadOf,
  sprintSpeedOf,
} from '../../../src/sim/stats.js';

describe('a stat', () => {
  it('reads from 1 to 99 as 0 to 1, and no further', () => {
    expect(shareOf(1)).toBe(0);
    expect(shareOf(99)).toBe(1);
    expect(shareOf(50)).toBeCloseTo(0.5);
    expect(shareOf(200)).toBe(1);
  });

  it('reads a pair of values between its ends', () => {
    expect(byStat([10, 20], 1)).toBe(10);
    expect(byStat([10, 20], 99)).toBe(20);
  });
});

describe('what the stats change', () => {
  it('makes a better shooter strike harder and straighter', () => {
    const weak = { stats: { shot: 10 } };
    const strong = { stats: { shot: 95 } };

    expect(shotSpeedOf(strong, 1)).toBeGreaterThan(shotSpeedOf(weak, 1));
    expect(shotSpreadOf(strong)).toBeLessThan(shotSpreadOf(weak));
  });

  it('makes a tired player sprint slower', () => {
    const fresh = { stats: { speed: 60 }, energy: 1 };
    const tired = { stats: { speed: 60 }, energy: 0 };

    expect(sprintSpeedOf(tired)).toBeLessThan(sprintSpeedOf(fresh));
  });

  it('gives a better keeper a longer reach, a dive longer still, scaled to the goal', () => {
    const { goal } = createMatch({ seed: 1 });
    const small = createMatch({ seed: 1, format: '7' }).goal;
    const good = { stats: { keeping: 90 } };
    const poor = { stats: { keeping: 20 } };

    expect(keeperReachOf(good, goal)).toBeGreaterThan(keeperReachOf(poor, goal));
    expect(diveReachOf(poor, goal)).toBeGreaterThan(keeperReachOf(good, goal));
    expect(keeperReachOf(good, small)).toBeLessThan(keeperReachOf(good, goal));
  });
});
