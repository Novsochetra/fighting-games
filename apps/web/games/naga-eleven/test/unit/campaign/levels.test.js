import { describe, expect, it } from 'vitest';
import {
  clampStat,
  heroAtLevel,
  levelForXp,
  spiritAtLevel,
  statsAtLevel,
  xpForLevel,
  xpToNext,
} from '../../../src/campaign/levels.js';
import { HERO_START, MAX_LEVEL } from '../../../src/data/progression.js';

describe('the level curve', () => {
  it('costs more XP for each level than the last', () => {
    const costs = Array.from({ length: 10 }, (_, i) => xpToNext(i + 1));

    expect(costs.every((cost, i) => i === 0 || cost > costs[i - 1])).toBe(true);
  });

  it('adds up the XP a level needs from level 1', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(xpToNext(1));
    expect(xpForLevel(4)).toBe(xpToNext(1) + xpToNext(2) + xpToNext(3));
  });

  it('reads the level from the XP, a level reached at its exact XP', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(xpForLevel(2) - 1)).toBe(1);
    expect(levelForXp(xpForLevel(2))).toBe(2);
    expect(levelForXp(xpForLevel(17) + 5)).toBe(17);
  });

  it('stops at the top level', () => {
    expect(levelForXp(10 ** 9)).toBe(MAX_LEVEL);
    expect(xpForLevel(MAX_LEVEL + 5)).toBe(xpForLevel(MAX_LEVEL));
  });
});

describe('stats by level', () => {
  it('are the starting stats at level 1', () => {
    expect(statsAtLevel(1)).toEqual(HERO_START.stats);
    expect(spiritAtLevel(1)).toBe(HERO_START.spiritMax);
  });

  it('grow with each level and stay within 1 and 99', () => {
    const low = statsAtLevel(10);
    const high = statsAtLevel(MAX_LEVEL);

    expect(low.shot).toBeGreaterThan(HERO_START.stats.shot);
    expect(spiritAtLevel(10)).toBeGreaterThan(HERO_START.spiritMax);

    for (const value of Object.values(high)) {
      expect(value).toBeLessThanOrEqual(99);
    }
  });

  it('clamp and round a stat', () => {
    expect(clampStat(120)).toBe(99);
    expect(clampStat(-3)).toBe(1);
    expect(clampStat(41.6)).toBe(42);
  });

  it('make a whole hero at a level', () => {
    expect(heroAtLevel(5)).toEqual({
      level: 5,
      xp: xpForLevel(5),
      stats: statsAtLevel(5),
      moves: HERO_START.moves,
      spiritMax: spiritAtLevel(5),
    });
  });
});
