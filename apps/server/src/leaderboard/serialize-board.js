import { toArcadeDay } from '../arcade-time.js';
import { posterImages } from './poster-files.js';

export function presentScore({ name, score, mission, hero, difficulty, seconds, cleared }) {
  return { name, score, mission, hero, difficulty, seconds, cleared };
}

const posterOf = (saved, storage) =>
  saved.poster && storage ? posterImages(saved.poster, storage.urlOf) : null;

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
