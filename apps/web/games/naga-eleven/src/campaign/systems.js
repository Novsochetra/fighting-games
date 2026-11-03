import { DUO_COMBOS, SYSTEMS_FROM } from '../data/combos.js';
import { CHAPTERS } from '../data/story/index.js';
import { resolvePosition } from './position.js';

// where a story match stands: its chapter and its stage in it, or null when this story has none
function placeOf(chapters, stageId) {
  for (const [chapter, { stages }] of chapters.entries()) {
    const stage = stages.findIndex((each) => each.id === stageId);

    if (stage >= 0) {
      return { chapter, stage };
    }
  }

  return null;
}

const isFrom = (at, from) =>
  at.chapter > from.chapter || (at.chapter === from.chapter && at.stage >= from.stage);

// the story brings each part in from the first match it plays in, both sides alike, and keeps it
// on after; a place past the story's end, or a part whose stage it lacks, plays everything
export function systemsAt(at, chapters = CHAPTERS) {
  const reached = (stageId) => {
    const from = placeOf(chapters, stageId);

    return !at || !from || isFrom(at, from);
  };

  return {
    passCombo: reached(SYSTEMS_FROM.passCombo),
    roleSkills: reached(SYSTEMS_FROM.roleSkills),
    chains: reached(SYSTEMS_FROM.chains),
    duos: DUO_COMBOS.filter((duo) => !duo.from || reached(duo.from)).map((duo) => duo.move),
  };
}

// a story match, by where it stands (`stage.at`); a duo that needs a move wakes in the match with
// the move itself, so it is on here and the match asks the striker for it
export const systemsForStage = (stage, chapters = CHAPTERS) =>
  systemsAt(stage?.at ? { chapter: stage.at.chapter, stage: stage.at.stage } : null, chapters);

// a quick match plays what the player's story has brought in so far
export const systemsForSave = (save, chapters = CHAPTERS) =>
  systemsAt(resolvePosition(save, chapters), chapters);
