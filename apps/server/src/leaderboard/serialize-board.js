import { toArcadeDay } from '../arcade-time.js';

export function presentScore({ name, score, mission, hero, difficulty, seconds, cleared }) {
  return { name, score, mission, hero, difficulty, seconds, cleared };
}

const presentDated = (saved) => ({ ...presentScore(saved), date: toArcadeDay(saved.createdAt) });

export function serializeBoard({ week, allTime }, weekStart) {
  return JSON.stringify({
    weekStart: toArcadeDay(weekStart),
    week: week.map(presentDated),
    allTime: allTime.map(presentDated),
  });
}
