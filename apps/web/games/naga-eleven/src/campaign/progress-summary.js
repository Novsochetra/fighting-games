import { MAX_LEVEL } from '../data/progression.js';
import { xpForLevel, xpToNext } from './levels.js';
import { resolvePosition } from './position.js';

function levelProgress({ level, xp }) {
  if (level >= MAX_LEVEL) {
    return { xpToNext: 0, levelShare: 1 };
  }

  const intoLevel = xp - xpForLevel(level);

  return {
    xpToNext: Math.max(0, xpForLevel(level + 1) - xp),
    levelShare: Math.min(1, Math.max(0, intoLevel / xpToNext(level))),
  };
}

export function progressSummary(save, chapters) {
  const position = resolvePosition(save, chapters);
  const current = position?.chapter ?? chapters.length;

  return {
    chapters: chapters.map((chapter, index) => ({
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      done: index < current,
      current: index === current,
    })),
    stage: position?.stage ?? null,
    finished: position === null,
    level: save.hero.level,
    xp: save.hero.xp,
    ...levelProgress(save.hero),
  };
}
