import { describe, expect, it } from 'vitest';
import { THOUSAND_CUTS } from '../../../src/data/ultimates/thousand-cuts.js';
import { PASSES, STILL_FRAME, SWORD_ROW } from '../../../src/sim/ultimates/cut-timing.js';
import { cutsFrame, leapLift } from '../../../src/sim/ultimates/thousand-cuts.js';

const { poseTicks, passesAt, releaseAt, leapAt, leapHeight, chopAt, end } = THOUSAND_CUTS;
const framesBetween = (from, to) => {
  const frames = new Set();
  for (let time = from; time < to; time++) {
    frames.add(cutsFrame(time)[1]);
  }
  return frames;
};

describe("Thousand Cuts' frames", () => {
  it('raises the dav, then its blade blazes through the cut-in', () => {
    expect(cutsFrame(0)).toEqual(['ult', 0]);
    expect(cutsFrame(poseTicks)).toEqual(['ult', 1]);
    expect(framesBetween(poseTicks * 2, passesAt)).toEqual(new Set([2, 3, 4]));
  });

  it('cuts each pass with his own sword strips, in the sword row', () => {
    for (const { cutAt, sprite } of PASSES) {
      expect(cutsFrame(cutAt)).toEqual([...sprite, SWORD_ROW]);
    }
  });

  it('stands still with the dav lowered while the cuts wait to land, and after', () => {
    expect(cutsFrame(releaseAt - 1)).toEqual(STILL_FRAME);
    expect(cutsFrame(leapAt - 1)).toEqual(STILL_FRAME);
  });

  it('leaps, chops as the ground splits and kneels over it to the end', () => {
    expect(framesBetween(leapAt, chopAt)).toEqual(new Set([5, 6]));
    expect(cutsFrame(chopAt)).toEqual(['ult', 7]);
    expect(cutsFrame(end)).toEqual(['ult', 8]);
  });
});

describe('his leap', () => {
  it('rises off the ground to its height halfway and lands back on the chop', () => {
    expect(leapLift(leapAt)).toBe(0);
    expect(leapLift(leapAt + 2)).toBeGreaterThan(0);
    expect(leapLift((leapAt + chopAt) / 2)).toBe(leapHeight);
    expect(leapLift(chopAt)).toBe(0);
  });
});
