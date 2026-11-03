import { CHAPTER_MIN_LEVEL } from '../data/progression.js';
import { raiseToLevel } from './growth.js';

const stagesIn = (chapter) => (Array.isArray(chapter?.stages) ? chapter.stages : []);

// a save made before a chapter lost stages points past its end: it goes on with the next chapter
export function resolvePosition(save, chapters) {
  let chapter = save.chapter;
  let stage = save.stage;

  while (chapters[chapter] && stage >= stagesIn(chapters[chapter]).length) {
    chapter += 1;
    stage = 0;
  }

  return chapters[chapter] ? { chapter, stage } : null;
}

export function moveOn(save, at) {
  if (at.stage + 1 < at.stageCount) {
    return { ...save, chapter: at.chapter, stage: at.stage + 1, attempts: 0 };
  }

  const floor = CHAPTER_MIN_LEVEL[at.chapterNumber + 1] ?? 1;

  return {
    ...save,
    chapter: at.chapter + 1,
    stage: 0,
    attempts: 0,
    hero: raiseToLevel(save.hero, floor),
  };
}

export const stayOn = (save, at) => ({
  ...save,
  chapter: at.chapter,
  stage: at.stage,
  attempts: save.attempts + 1,
});

// the stage it goes back to has been played before, so its before scene is not shown again
export const goBackTo = (save, at, stage) => ({ ...save, chapter: at.chapter, stage, attempts: 1 });
