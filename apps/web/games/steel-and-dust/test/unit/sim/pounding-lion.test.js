import { describe, expect, it } from 'vitest';
import { POUNDING_LION } from '../../../src/data/ultimates/pounding-lion.js';
import { FINALE_START, poundingFrame } from '../../../src/sim/ultimates/pounding-frames.js';
import { FISTS_ROW, RUSH_BLOWS, WAKE_AT } from '../../../src/sim/ultimates/rush-timing.js';

const { intro, poseTicks, slamAt, gatherAt, rushAt, pounceAt, end } = POUNDING_LION;
const stripAt = (time) => poundingFrame(time).slice(0, 2);
const sameFrame = (first, second) => poundingFrame(first).join() === poundingFrame(second).join();

// the longest run of ticks the pose holds one frame between two ticks
function longestHold(from, to) {
  let longest = 0;
  let run = 0;
  for (let time = from; time < to; time++) {
    run = sameFrame(time, time - 1) ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return longest;
}

describe("Pounding the Lion's frames", () => {
  it('fights it all bare-handed, from his fists row, never the sword strip', () => {
    for (let time = 0; time <= end; time++) {
      const [strip, , row] = poundingFrame(time);
      expect(strip, `tick ${time}`).not.toBe('ult');
      expect(row, `tick ${time}`).toBe(FISTS_ROW);
    }
  });

  it('bows in the Bokator salute through the cut-in, then steps into his stance', () => {
    expect(stripAt(0)).toEqual(['win', 0]);
    expect(stripAt(poseTicks * 2)).toEqual(['win', 2]);
    expect(stripAt(poseTicks * 3)).toEqual(['idle', 0]);
    expect(intro).toBeLessThan(poseTicks * 4);
  });

  it('leaps with his fist raised and drives it into the ground on the tick it slams', () => {
    expect(stripAt(slamAt - 12)).toEqual(['cleave', 1]);
    expect(stripAt(slamAt - 1)).toEqual(['cleave', 2]);
    expect(stripAt(slamAt)).toEqual(['cleave', 3]);
    expect(stripAt(gatherAt - 1)).toEqual(['cleave', 3]);
  });

  it('coils before the rush and strikes each blow in his bare-hand strips', () => {
    expect(stripAt(gatherAt)).toEqual(stripAt(rushAt - 1));
    for (const { strikeAt, sprite } of RUSH_BLOWS) {
      expect(stripAt(strikeAt)).toEqual(sprite);
    }
  });

  it('stands in his stance while the pride wakes, then pounds the ground with both fists as it pounces', () => {
    expect(stripAt(WAKE_AT)[0]).toBe('idle');
    expect(stripAt(FINALE_START - 1)[0]).toBe('idle');
    expect(stripAt(FINALE_START)).toEqual(['plunge', 0]);
    expect(stripAt(pounceAt - 1)).toEqual(['plunge', 1]);
    expect(stripAt(pounceAt)).toEqual(['plunge', 2]);
    expect(stripAt(end)).toEqual(['plunge', 3]);
  });

  it('never stands frozen on one frame for more than a second and a half', () => {
    expect(longestHold(1, end)).toBeLessThanOrEqual(90);
  });
});
