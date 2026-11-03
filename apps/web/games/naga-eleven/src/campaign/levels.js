import {
  HERO_START,
  LEVEL_CURVE,
  MAX_LEVEL,
  SPIRIT_GROWTH,
  STAT_GROWTH,
  STAT_LIMITS,
} from '../data/progression.js';

export const xpToNext = (level) => LEVEL_CURVE.base + LEVEL_CURVE.step * level;

export function xpForLevel(level) {
  let total = 0;

  for (let reached = 1; reached < Math.min(level, MAX_LEVEL); reached += 1) {
    total += xpToNext(reached);
  }

  return total;
}

export function levelForXp(xp) {
  let level = 1;

  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) {
    level += 1;
  }

  return level;
}

export const clampStat = (value) =>
  Math.min(STAT_LIMITS.max, Math.max(STAT_LIMITS.min, Math.round(value)));

const growthAt = (perLevel, level) => Math.round(perLevel * (level - 1));

export function statsAtLevel(level) {
  const stats = Object.entries(HERO_START.stats).map(([stat, start]) => [
    stat,
    clampStat(start + growthAt(STAT_GROWTH[stat] ?? 0, level)),
  ]);

  return Object.fromEntries(stats);
}

export const spiritAtLevel = (level) => HERO_START.spiritMax + growthAt(SPIRIT_GROWTH, level);

export function heroAtLevel(level) {
  return {
    level,
    xp: xpForLevel(level),
    stats: statsAtLevel(level),
    moves: [...HERO_START.moves],
    spiritMax: spiritAtLevel(level),
  };
}
