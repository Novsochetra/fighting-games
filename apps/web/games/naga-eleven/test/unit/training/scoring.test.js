import { describe, expect, it } from 'vitest';
import {
  breakCombo,
  gradeOf,
  held,
  isBetter,
  MARK_TICKS,
  pressed,
  pruneMarks,
  pushMark,
  scorePoints,
} from '../../../src/training/scoring.js';

const THRESHOLDS = { S: 0.85, A: 0.65, B: 0.4 };

const fresh = () => ({ tick: 0, score: 0, combo: 0, bestCombo: 0, marks: [], events: [] });

describe('a drill grade', () => {
  it('is the share of the top score reached', () => {
    expect(gradeOf(1000, 1000, THRESHOLDS)).toBe('S');
    expect(gradeOf(850, 1000, THRESHOLDS)).toBe('S');
    expect(gradeOf(849, 1000, THRESHOLDS)).toBe('A');
    expect(gradeOf(650, 1000, THRESHOLDS)).toBe('A');
    expect(gradeOf(400, 1000, THRESHOLDS)).toBe('B');
    expect(gradeOf(399, 1000, THRESHOLDS)).toBe('C');
    expect(gradeOf(0, 1000, THRESHOLDS)).toBe('C');
  });

  it('is a C when there is no top score to reach', () => {
    expect(gradeOf(50, 0, THRESHOLDS)).toBe('C');
  });

  it('orders the grades C, B, A, S', () => {
    expect(isBetter('S', 'A')).toBe(true);
    expect(isBetter('B', 'C')).toBe(true);
    expect(isBetter('B', 'A')).toBe(false);
    expect(isBetter('A', 'A')).toBe(false);
  });
});

describe('points and the combo', () => {
  it('builds the combo with each scoring move and keeps its best', () => {
    const state = fresh();

    scorePoints(state, 40);
    scorePoints(state, 50);
    breakCombo(state);
    scorePoints(state, 40);

    expect(state.score).toBe(130);
    expect(state.combo).toBe(1);
    expect(state.bestCombo).toBe(2);
  });

  it('keeps a mark for the drawing a moment, and tells the app of it once', () => {
    const state = fresh();

    pushMark(state, { kind: 'clean', x: 3, y: 4, points: 40 });

    expect(state.events).toEqual([{ type: 'clean', kind: 'clean', x: 3, y: 4, points: 40 }]);
    expect(state.marks[0]).toMatchObject({ kind: 'clean', at: 0 });

    state.tick = MARK_TICKS - 1;
    pruneMarks(state);
    expect(state.marks).toHaveLength(1);

    state.tick = MARK_TICKS;
    pruneMarks(state);
    expect(state.marks).toHaveLength(0);
  });
});

describe('reading the input', () => {
  it('reads held and pressed actions, and nothing from a missing input', () => {
    const input = { held: { up: true }, pressed: { pass: true } };

    expect(held(input, 'up')).toBe(true);
    expect(held(input, 'down')).toBe(false);
    expect(pressed(input, 'pass')).toBe(true);
    expect(pressed(undefined, 'pass')).toBe(false);
    expect(held({}, 'up')).toBe(false);
  });
});
