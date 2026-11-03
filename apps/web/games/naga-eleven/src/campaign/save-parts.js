import { HERO_START } from '../data/progression.js';
import { clampStat, heroAtLevel, levelForXp, spiritAtLevel, statsAtLevel } from './levels.js';
import { countOf, isCount, isRecord } from './values.js';

function repairStats(stats, level) {
  const fallback = statsAtLevel(level);
  const repaired = Object.keys(HERO_START.stats).map((stat) => {
    const value = stats?.[stat];

    return [stat, Number.isFinite(value) ? clampStat(value) : fallback[stat]];
  });

  return Object.fromEntries(repaired);
}

// the level always follows from the XP, so a hand-edited level cannot skip the curve
export function repairHero(hero) {
  if (!isRecord(hero)) {
    return heroAtLevel(1);
  }

  const xp = Number.isFinite(hero.xp) && hero.xp > 0 ? Math.round(hero.xp) : 0;
  const level = levelForXp(xp);
  const moves = Array.isArray(hero.moves)
    ? hero.moves.filter((move) => typeof move === 'string')
    : [];

  return {
    ...hero,
    level,
    xp,
    stats: repairStats(hero.stats, level),
    moves: [...new Set([...HERO_START.moves, ...moves])],
    spiritMax:
      Number.isFinite(hero.spiritMax) && hero.spiritMax > 0
        ? Math.round(hero.spiritMax)
        : spiritAtLevel(level),
  };
}

const isResult = (result) =>
  isRecord(result) &&
  typeof result.home === 'string' &&
  typeof result.away === 'string' &&
  isCount(result.homeGoals) &&
  isCount(result.awayGoals);

function repairRecord(record) {
  if (!isRecord(record) || !Array.isArray(record.teams) || !Array.isArray(record.results)) {
    return null;
  }

  return {
    ...record,
    teams: record.teams.filter((team) => typeof team === 'string'),
    results: record.results.filter(isResult),
    replays: countOf(record.replays),
  };
}

export function repairCups(cups) {
  const entries = Object.entries(isRecord(cups) ? cups : {})
    .map(([cupId, record]) => [cupId, repairRecord(record)])
    .filter(([, record]) => record);

  return Object.fromEntries(entries);
}
