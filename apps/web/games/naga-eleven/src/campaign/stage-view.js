import { groupOf } from './group-view.js';
import { resolvePosition } from './position.js';

function cupOf(chapter, cupId) {
  const cup = cupId ? chapter.cups?.[cupId] : null;

  return cup ? { ...cup, id: cupId } : null;
}

function contextOf({ chapter, position, stage, teams }) {
  const cup = cupOf(chapter, stage.cup);
  const isGroup = stage.kind === 'match' && stage.rule === 'group' && cup?.kind === 'group';

  return {
    chapter: position.chapter,
    stage: position.stage,
    stageCount: chapter.stages.length,
    chapterId: chapter.id,
    chapterNumber: chapter.number,
    team: chapter.team,
    format: chapter.format,
    heroAge: chapter.heroAge,
    cup,
    group: isGroup ? groupOf({ chapter, stageIndex: position.stage, cup, teams }) : null,
  };
}

// the stage comes with `at`, where it stands in the story, which finishing it needs; pass the teams
// so the other group matches are played by each team's real strength
export function stageOf(save, chapters, teams) {
  const position = resolvePosition(save, chapters);

  if (!position) {
    return null;
  }

  const chapter = chapters[position.chapter];
  const stage = chapter.stages[position.stage];

  return { ...stage, at: contextOf({ chapter, position, stage, teams }) };
}
