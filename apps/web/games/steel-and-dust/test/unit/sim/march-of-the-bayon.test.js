import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { MARCH_OF_THE_BAYON } from '../../../src/data/ultimates/march-of-the-bayon.js';
import { leapLift, marchFrame, rankLayout } from '../../../src/sim/ultimates/march-of-the-bayon.js';

const { poseTicks, leapAt, leapHeight, chopAt, end, ranks, spacing, edge, wave, beats } =
  MARCH_OF_THE_BAYON;
const framesBetween = (from, to) => {
  const frames = new Set();
  for (let time = from; time < to; time++) {
    frames.add(marchFrame(time)[1]);
  }
  return frames;
};
const game = { camera: { x: 1000 } };
const player = { x: 1000 + 150 };

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

describe('his leap', () => {
  it('rises off the ground to its height halfway and lands back on the chop', () => {
    expect(leapLift(leapAt)).toBe(0);
    expect(leapLift(leapAt + 2)).toBeGreaterThan(0);
    expect(leapLift((leapAt + chopAt) / 2)).toBe(leapHeight);
    expect(leapLift(chopAt)).toBe(0);
  });
});

describe("a rank's soldiers", () => {
  const [first, second] = ranks.map((rank) => rankLayout(game, player, rank));

  it('stand across the whole screen, kept off its edges', () => {
    for (const soldiers of [first, second]) {
      const xs = soldiers.map(({ x }) => x);
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(game.camera.x + edge);
      expect(Math.max(...xs)).toBeLessThanOrEqual(game.camera.x + VIEW_WIDTH - edge);
      expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(VIEW_WIDTH / 2);
    }
  });

  it('stand between the last rank, and none on top of him', () => {
    const near = (soldiers) => soldiers.filter(({ x }) => Math.abs(x - player.x) < spacing / 3);
    expect(near(first)).toEqual([]);
    expect(near(second)).toEqual([]);
    for (const { x } of second) {
      const gaps = first.map((soldier) => Math.abs(soldier.x - x));
      expect(Math.min(...gaps)).toBe(spacing / 2);
    }
  });

  it('fight his own moves, no two soldiers side by side alike', () => {
    for (const soldiers of [first, second]) {
      soldiers.forEach((soldier, i) => {
        expect(soldier.moves).toHaveLength(beats.length);
        if (i > 0) {
          expect(soldier.moves).not.toEqual(soldiers[i - 1].moves);
        }
      });
    }
  });

  it('step out in a wave from his feet, the furthest last', () => {
    const fromHim = (soldier) => Math.abs(soldier.x - player.x);
    const nearestFirst = (soldiers) =>
      [...soldiers].sort((one, two) => fromHim(one) - fromHim(two));
    for (const soldiers of [first, second]) {
      const inOrder = nearestFirst(soldiers).map(({ wait }) => wait);
      expect(inOrder).toEqual([...inOrder].sort((one, two) => one - two));
      expect(inOrder[0]).toBeLessThan(inOrder[inOrder.length - 1]);
      expect(inOrder[inOrder.length - 1]).toBeLessThanOrEqual(wave);
    }
  });
});
