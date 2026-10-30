import { toArcadeDay } from '../arcade-time.js';
import { isPosterKey, posterImages } from './poster-files.js';

export function presentScore({ name, score, mission, hero, difficulty, seconds, cleared }) {
  return { name, score, mission, hero, difficulty, seconds, cleared };
}

// a value typed in by hand in place of a key would point at files that are not there, and the board
// would show broken pictures
const posterOf = (saved, storage) =>
  storage && isPosterKey(saved.poster, saved.game)
    ? posterImages(saved.poster, storage.urlOf)
    : null;

export function serializeBoard({ week, allTime }, { weekStart, storage = null }) {
  const present = (saved) => ({
    ...presentScore(saved),
    date: toArcadeDay(saved.createdAt),
    poster: posterOf(saved, storage),
  });

  return JSON.stringify({
    weekStart: toArcadeDay(weekStart),
    week: week.map(present),
    allTime: allTime.map(present),
  });
}
