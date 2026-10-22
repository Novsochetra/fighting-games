import { describe, expect, it } from 'vitest';
import { POUNDING_LION } from '../../../src/data/ultimates/pounding-lion.js';
import { POUNCE_AT, poundingFrame } from '../../../src/sim/ultimates/pounding-lion.js';
import { FISTS_ROW, RUSH_BLOWS, WAKE_AT } from '../../../src/sim/ultimates/rush-timing.js';

const { intro, slamAt, gatherAt, rushAt, end } = POUNDING_LION;
const SLAM_FRAME = 5;
const HELD_HIGH = 8;
const frameAt = (time) => poundingFrame(time)[1];
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
  it('bows and raises the sword through the cut-in', () => {
    expect(frameAt(0)).toBe(0);
    expect(new Set([0, 1, 2].map((frame) => frameAt(frame * POUNDING_LION.poseTicks)))).toEqual(
      new Set([0, 1, 2]),
    );
    expect(frameAt(intro)).toBeLessThan(SLAM_FRAME);
  });

  it('swings fast and lands the slam on the tick it strikes', () => {
    expect(frameAt(slamAt - 1)).toBe(4);
    expect(frameAt(slamAt - 7)).toBe(3);
    expect(frameAt(slamAt)).toBe(SLAM_FRAME);
  });

  it('lets the sword go and coils bare-handed before the rush', () => {
    expect(poundingFrame(gatherAt - 1)[0]).toBe('ult');
    const coil = poundingFrame(gatherAt);
    expect(coil[0]).not.toBe('ult');
    expect(coil[2]).toBe(FISTS_ROW);
    expect(poundingFrame(rushAt - 1)).toEqual(coil);
  });

  it('strikes each blow of the rush in his bare-hand strips', () => {
    for (const { strikeAt, sprite } of RUSH_BLOWS) {
      expect(poundingFrame(strikeAt)).toEqual([...sprite, FISTS_ROW]);
    }
  });

  it('takes the sword back and holds it high while the pride wakes, then pounds the ground again', () => {
    expect(poundingFrame(WAKE_AT)).toEqual(['ult', HELD_HIGH]);
    expect(frameAt(POUNCE_AT - 20)).toBe(HELD_HIGH);
    expect(frameAt(POUNCE_AT - 1)).toBe(4);
    expect(frameAt(POUNCE_AT)).toBe(SLAM_FRAME);
    expect(frameAt(end)).toBe(HELD_HIGH);
  });

  it('never stands frozen on one frame for more than a second and a half', () => {
    expect(longestHold(1, end)).toBeLessThanOrEqual(90);
  });
});
