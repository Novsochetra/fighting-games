import { describe, expect, it } from 'vitest';
import { MARCH_OF_THE_BAYON } from '../../../src/data/ultimates/march-of-the-bayon.js';
import { marchFrame } from '../../../src/sim/ultimates/march-of-the-bayon.js';

const { poseTicks, leapAt, chopAt, end } = MARCH_OF_THE_BAYON;
const framesBetween = (from, to) => {
  const frames = new Set();
  for (let time = from; time < to; time++) {
    frames.add(marchFrame(time)[1]);
  }
  return frames;
};

describe("the March of the Bayon's frames", () => {
  it('raises the dav, then its blade blazes until he leaps', () => {
    expect(marchFrame(0)).toEqual(['ult', 0]);
    expect(marchFrame(poseTicks)).toEqual(['ult', 1]);
    expect(framesBetween(poseTicks * 2, leapAt)).toEqual(new Set([2, 3, 4]));
  });

  it('leaps, chops as the ground splits and kneels over it to the end', () => {
    expect(framesBetween(leapAt, chopAt)).toEqual(new Set([5, 6]));
    expect(marchFrame(chopAt)).toEqual(['ult', 7]);
    expect(marchFrame(end)).toEqual(['ult', 8]);
  });
});
