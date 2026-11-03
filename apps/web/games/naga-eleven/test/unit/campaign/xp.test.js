import { describe, expect, it } from 'vitest';
import { matchXp, trainingXp } from '../../../src/campaign/xp.js';
import { CHAPTER_XP_SCALE, GRADE_XP, MATCH_XP } from '../../../src/data/progression.js';
import { matchResult, trainingResult } from '../../support/campaign-fixtures.js';

describe('XP from a match', () => {
  it('pays the result', () => {
    const plain = matchResult(0, 0);

    expect(matchXp(plain, 'win', 1)).toBe(MATCH_XP.win);
    expect(matchXp(plain, 'draw', 1)).toBe(MATCH_XP.draw);
    expect(matchXp(plain, 'lose', 1)).toBe(MATCH_XP.lose);
  });

  it("adds the team's goals, Sochetra's goals and the duels won", () => {
    const result = matchResult(3, 1, { goalsBySochetra: 2, duelsWon: 4 });
    const expected = MATCH_XP.win + 3 * MATCH_XP.goal + 2 * MATCH_XP.heroGoal + 4 * MATCH_XP.duel;

    expect(matchXp(result, 'win', 1)).toBe(expected);
  });

  it('caps what a runaway score can pay', () => {
    const huge = matchResult(40, 0, { goalsBySochetra: 40, duelsWon: 99 });
    const capped = matchResult(MATCH_XP.maxGoals, 0, {
      goalsBySochetra: MATCH_XP.maxHeroGoals,
      duelsWon: MATCH_XP.maxDuels,
    });

    expect(matchXp(huge, 'win', 1)).toBe(matchXp(capped, 'win', 1));
  });

  it('scales with the chapter', () => {
    const result = matchResult(2, 1);

    expect(matchXp(result, 'win', 3)).toBe(
      Math.round(matchXp(result, 'win', 1) * CHAPTER_XP_SCALE[3]),
    );
    expect(matchXp(result, 'win', 99)).toBe(matchXp(result, 'win', 1));
  });

  it('reads missing counts as none', () => {
    expect(matchXp({}, 'lose', 1)).toBe(MATCH_XP.lose);
  });
});

describe('XP from training', () => {
  it('pays the grade, and a little more for the score', () => {
    expect(trainingXp(trainingResult('target-shot', 'S', 0), 1)).toBe(GRADE_XP.S);
    expect(trainingXp(trainingResult('target-shot', 'S', 1500), 1)).toBeGreaterThan(GRADE_XP.S);
  });

  it('pays a better grade more than any score can make up', () => {
    const lowGrade = trainingXp(trainingResult('spirit-focus', 'B', 10 ** 7), 1);

    expect(trainingXp(trainingResult('spirit-focus', 'A', 0), 1)).toBeGreaterThan(lowGrade);
  });

  it('pays an unknown grade as the lowest, and ignores a negative score', () => {
    expect(trainingXp({ grade: 'Z', score: -400 }, 1)).toBe(GRADE_XP.C);
  });

  it('scales with the chapter', () => {
    const result = trainingResult('cone-dribble', 'A', 0);

    expect(trainingXp(result, 2)).toBe(Math.round(GRADE_XP.A * CHAPTER_XP_SCALE[2]));
  });
});
