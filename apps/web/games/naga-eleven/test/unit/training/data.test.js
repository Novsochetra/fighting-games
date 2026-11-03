import { describe, expect, it } from 'vitest';
import { DRILL_IDS, DRILLS } from '../../../src/data/training.js';

const KHMER = /[ក-៿]/;

describe('the drills table', () => {
  it('holds the three drills the story trains with', () => {
    expect(DRILL_IDS).toEqual(['cone-dribble', 'target-shot', 'spirit-focus']);
  });

  it.each(DRILL_IDS)('names %s and says how to play it in both languages', (id) => {
    const drill = DRILLS[id];

    expect(drill.id).toBe(id);

    for (const text of [drill.name, drill.reward, ...drill.howTo]) {
      expect(text.en).toBeTruthy();
      expect(text.km).toMatch(KHMER);
    }
  });

  it.each(DRILL_IDS)('grades %s with thresholds that climb from B to S', (id) => {
    const { grades } = DRILLS[id];

    expect(grades.B).toBeGreaterThan(0);
    expect(grades.A).toBeGreaterThan(grades.B);
    expect(grades.S).toBeGreaterThan(grades.A);
    expect(grades.S).toBeLessThanOrEqual(1);
  });
});
