import { describe, expect, it } from 'vitest';
import {
  CHAPTER_MIN_LEVEL,
  CHAPTER_XP_SCALE,
  DRILL_GROWTH,
  GRADE_STEPS,
  GRADE_XP,
  HERO_START,
  LOWEST_GRADE,
  MATCH_XP,
  MAX_LEVEL,
  STAT_GROWTH,
} from '../../../src/data/progression.js';

const rising = (values) => values.every((value, i) => i === 0 || value > values[i - 1]);

const STATS = ['speed', 'shot', 'pass', 'dribble', 'tackle', 'keeping', 'stamina'];

describe('the progression tables', () => {
  it('sets a rising floor and a rising XP scale for each of the four chapters', () => {
    expect(Object.keys(CHAPTER_MIN_LEVEL)).toEqual(['1', '2', '3', '4']);
    expect(Object.keys(CHAPTER_XP_SCALE)).toEqual(['1', '2', '3', '4']);
    expect(rising(Object.values(CHAPTER_MIN_LEVEL))).toBe(true);
    expect(rising(Object.values(CHAPTER_XP_SCALE))).toBe(true);
    expect(CHAPTER_MIN_LEVEL[4]).toBeLessThan(MAX_LEVEL);
  });

  it('starts Sochetra as a gifted kid: every stat known and between 1 and 99', () => {
    expect(Object.keys(HERO_START.stats).sort()).toEqual([...STATS].sort());

    for (const value of Object.values(HERO_START.stats)) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(60);
    }

    expect(HERO_START.moves).toContain('power-shot');
  });

  it('grows shot, dribble and speed fastest', () => {
    const gift = Math.min(STAT_GROWTH.shot, STAT_GROWTH.dribble, STAT_GROWTH.speed);
    const others = ['pass', 'tackle', 'keeping', 'stamina'].map((stat) => STAT_GROWTH[stat]);

    expect(Object.keys(STAT_GROWTH).sort()).toEqual([...STATS].sort());
    expect(gift).toBeGreaterThanOrEqual(Math.max(...others));
  });

  it('trains only real stats and the spirit gauge in each drill', () => {
    expect(Object.keys(DRILL_GROWTH).sort()).toEqual([
      'cone-dribble',
      'spirit-focus',
      'target-shot',
    ]);

    for (const growth of Object.values(DRILL_GROWTH)) {
      for (const stat of Object.keys(growth)) {
        expect([...STATS, 'spiritMax']).toContain(stat);
      }
    }
  });

  it('pays the better grades more, the training grades being S, A, B and C', () => {
    expect(Object.keys(GRADE_XP)).toEqual(['S', 'A', 'B', 'C']);
    expect(Object.keys(GRADE_STEPS)).toEqual(['S', 'A', 'B', 'C']);
    expect(rising(Object.values(GRADE_XP).reverse())).toBe(true);
    expect(rising(Object.values(GRADE_STEPS).reverse())).toBe(true);
    expect(LOWEST_GRADE).toBe('C');
  });

  it('pays a win more than a draw and a draw more than a loss', () => {
    expect(MATCH_XP.win).toBeGreaterThan(MATCH_XP.draw);
    expect(MATCH_XP.draw).toBeGreaterThan(MATCH_XP.lose);
    expect(MATCH_XP.lose).toBeGreaterThan(0);
  });
});
