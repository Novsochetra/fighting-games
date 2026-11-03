import { isRecord } from '../values.js';
import { chapterHeadProblems, cupProblems } from './head.js';
import { sceneProblems } from './scenes.js';
import { stageProblems } from './stages.js';

// known: { teams, venues, backdrops, drills, moves, characters }, each a list of ids, a list of
// objects with ids, a Set or an object keyed by id; a list left out is not checked
export function chapterProblems(chapter, known = {}) {
  if (!isRecord(chapter)) {
    return ['the chapter is not an object'];
  }

  const sound = {
    ...chapter,
    stages: Array.isArray(chapter.stages) ? chapter.stages : [],
    scenes: isRecord(chapter.scenes) ? chapter.scenes : {},
  };
  const context = { chapter: sound, known };

  return [
    ...chapterHeadProblems({ chapter, known }),
    ...cupProblems(context),
    ...stageProblems(context),
    ...sceneProblems(context),
  ];
}
