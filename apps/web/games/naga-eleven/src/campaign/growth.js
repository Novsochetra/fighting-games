import { DRILL_GROWTH, GRADE_STEPS } from '../data/progression.js';
import { clampStat, levelForXp, spiritAtLevel, statsAtLevel, xpForLevel } from './levels.js';

const mapStats = (stats, change) =>
  Object.fromEntries(Object.entries(stats).map(([stat, value]) => [stat, change(stat, value)]));

function growToLevel(hero, level) {
  const from = statsAtLevel(hero.level);
  const to = statsAtLevel(level);
  const stats = mapStats(hero.stats, (stat, value) =>
    clampStat(value + (to[stat] ?? 0) - (from[stat] ?? 0)),
  );

  return {
    ...hero,
    level,
    stats,
    spiritMax: hero.spiritMax + spiritAtLevel(level) - spiritAtLevel(hero.level),
  };
}

export function gainXp(hero, amount) {
  const xp = hero.xp + Math.max(0, Math.round(Number(amount) || 0));

  return { ...growToLevel(hero, levelForXp(xp)), xp };
}

export function raiseToLevel(hero, level) {
  return hero.level >= level ? hero : gainXp(hero, xpForLevel(level) - hero.xp);
}

export function trainHero(hero, drill, grade) {
  const { spiritMax = 0, ...statGrowth } = DRILL_GROWTH[drill] ?? {};
  const steps = GRADE_STEPS[grade] ?? 0;
  const stats = mapStats(hero.stats, (stat, value) =>
    clampStat(value + (statGrowth[stat] ?? 0) * steps),
  );

  return { ...hero, stats, spiritMax: hero.spiritMax + spiritMax * steps };
}

export function learnMoves(hero, moves) {
  const learned = [moves].flat().filter((move) => typeof move === 'string' && move.length > 0);

  return { ...hero, moves: [...new Set([...hero.moves, ...learned])] };
}

export function growHero(hero, { xp = 0, moves = [], drill = null, grade = null }) {
  const trained = drill ? trainHero(hero, drill, grade) : hero;

  return learnMoves(gainXp(trained, xp), moves);
}
