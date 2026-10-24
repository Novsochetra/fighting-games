import { describe, expect, it } from 'vitest';
import {
  cardAge,
  cardDoneAt,
  cardLetterCount,
  WIPE_TICKS,
} from '../../../src/data/mission-handoff.js';
import {
  countDoneAt,
  purseTake,
  rowStartsAt,
  shownValue,
  stepNow,
  SUMMARY,
  SUMMARY_KINDS,
  SUMMARY_TICKS,
  summaryValues,
  TOTAL_ROW,
} from '../../../src/data/mission-summary.js';
import { CLEAR_TICKS } from '../../../src/sim/stage/stage-clear.js';

const shownOver = (value, ticks) => Array.from({ length: ticks }, (_, i) => shownValue(value, i));

describe('the loot summary at a clear', () => {
  it('opens only once every letter of the clear card is down', () => {
    const cardDelay = -cardAge({ age: 0 }, true);
    const cardDone = cardDelay + cardDoneAt(cardLetterCount('Mission complete'));
    expect(SUMMARY.openAt).toBeGreaterThan(cardDone);
  });

  it('brings in the kinds one after another, then the take, each after the panel opens', () => {
    const starts = [...SUMMARY_KINDS, 'take'].map((_, row) => rowStartsAt(row));
    expect(starts[0]).toBe(SUMMARY.openAt + SUMMARY.openTicks);
    starts.slice(1).forEach((start, i) => expect(start - starts[i]).toBe(SUMMARY.rowTicks));
  });

  it("finishes each row's count before the next row comes in", () => {
    const longest = SUMMARY.countFrom + (SUMMARY.maxSteps - 1) * SUMMARY.stepTicks;
    expect(longest).toBeLessThan(SUMMARY.rowTicks);
  });

  it('holds the counted take a moment, then the wipe closes the clear', () => {
    expect(SUMMARY_TICKS - rowStartsAt(TOTAL_ROW)).toBeGreaterThan(SUMMARY.rowTicks);
    expect(CLEAR_TICKS).toBe(SUMMARY_TICKS + WIPE_TICKS);
  });
});

describe('a count rolling up', () => {
  it('starts at nothing and ends on its value, never going back', () => {
    for (const value of [0, 1, 4, 7, 22, 140]) {
      const shown = shownOver(value, SUMMARY.rowTicks);
      expect(shown[0]).toBe(0);
      expect(shown.at(-1)).toBe(value);
      shown.slice(1).forEach((each, i) => expect(each).toBeGreaterThanOrEqual(shown[i]));
    }
  });

  it('takes a step a piece for a few, and only a few steps for many', () => {
    const steps = (value) =>
      Array.from({ length: SUMMARY.rowTicks }, (_, i) => stepNow(value, i)).filter(
        (step) => step >= 0,
      );
    expect(steps(3)).toEqual([0, 1, 2]);
    expect(steps(0)).toEqual([]);
    expect(steps(140)).toHaveLength(SUMMARY.maxSteps);
  });

  it('is counted on the tick its last step lands', () => {
    expect(countDoneAt(3)).toBe(SUMMARY.countFrom + 2 * SUMMARY.stepTicks);
    expect(shownValue(3, countDoneAt(3) - 1)).toBeLessThan(3);
    expect(shownValue(3, countDoneAt(3))).toBe(3);
    expect(countDoneAt(0)).toBe(SUMMARY.countFrom);
  });
});

describe('what the road gave', () => {
  it('sums a coin as one and a gem as ten, and an apple as nothing', () => {
    expect(purseTake({ coin: 22, gem: 5, apple: 1 })).toBe(72);
  });

  it('lists each kind in turn and the take last', () => {
    expect(summaryValues({ coin: 3, gem: 1, apple: 2 })).toEqual([3, 1, 2, 13]);
  });
});
