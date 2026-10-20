import { describe, expect, it } from 'vitest';
import { HOP_REACH, hopSpeed, hopTimes } from '../../../src/sim/brains/enemy/hop.js';

describe('the arc of a raider hop', () => {
  it('passes over a face once it has risen to within a step of its top', () => {
    expect(hopTimes(20)).toEqual({ clear: 3, land: 34 });
    expect(hopTimes(48)).toEqual({ clear: 10, land: 25 });
  });

  it('rises past its reach and comes back down onto it', () => {
    const { clear, land } = hopTimes(HOP_REACH);
    expect(clear).toBeGreaterThan(0);
    expect(land).toBeGreaterThan(clear);
  });

  it('comes down later on a lower ledge than on a higher one', () => {
    expect(hopTimes(12).land).toBeGreaterThan(hopTimes(36).land);
  });
});

describe('the speed of a raider hop', () => {
  it('goes straight up when the raider already stands under its landing spot', () => {
    expect(hopSpeed({ travel: 0, faceGap: null, rise: 32 })).toBe(0);
  });

  it('comes down on the landing spot, either way', () => {
    const { land } = hopTimes(20);
    expect(hopSpeed({ travel: 26, faceGap: null, rise: 20 })).toBeCloseTo(26 / land);
    expect(hopSpeed({ travel: -26, faceGap: null, rise: 20 })).toBeCloseTo(-26 / land);
  });

  it('never carries a raider faster than 1.4 a tick', () => {
    expect(hopSpeed({ travel: 300, faceGap: null, rise: 20 })).toBe(1.4);
  });

  it('reaches a face right in front only after rising high enough to pass over it', () => {
    const { clear } = hopTimes(30);
    const speed = hopSpeed({ travel: 11, faceGap: 1, rise: 30 });
    expect(speed).toBeGreaterThan(0);
    expect(speed * clear).toBeLessThan(1);
  });
});
