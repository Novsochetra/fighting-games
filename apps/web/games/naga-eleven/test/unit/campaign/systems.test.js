import { describe, expect, it } from 'vitest';
import { newSave } from '../../../src/campaign/save.js';
import { stageOf } from '../../../src/campaign/stage-view.js';
import { systemsAt, systemsForSave, systemsForStage } from '../../../src/campaign/systems.js';
import { DUO_COMBOS } from '../../../src/data/combos.js';
import { CHAPTERS } from '../../../src/data/story/index.js';
import { TEAMS } from '../../../src/data/teams/index.js';

const ALL_DUOS = DUO_COMBOS.map((duo) => duo.move);

// where a story match stands, by its id
function placeOf(id) {
  for (const [chapter, { stages }] of CHAPTERS.entries()) {
    const stage = stages.findIndex((each) => each.id === id);

    if (stage >= 0) {
      return { chapter, stage };
    }
  }

  return null;
}

const at = (id) => systemsAt(placeOf(id));

describe('what the story has brought in by a match', () => {
  it('starts the pass combo at the friendly, the role skills at the semi-final', () => {
    expect(at('ch1-friendly')).toMatchObject({ passCombo: true, roleSkills: false, chains: false });
    expect(at('ch1-semi')).toMatchObject({ passCombo: true, roleSkills: true, chains: false });
  });

  it('starts the chains in the second chapter’s group, and keeps everything on after', () => {
    expect(at('ch1-final').chains).toBe(false);
    expect(at('ch2-group-siem-reap').chains).toBe(true);
    expect(at('ch4-final')).toMatchObject({ passCombo: true, roleSkills: true, chains: true });
  });

  it('wakes each of Sochetra’s duos from its match, the rivals’ always theirs', () => {
    expect(at('ch1-friendly').duos).toEqual(['twin-naga', 'moon-relay', 'carnival-bicycle']);
    expect(at('ch2-semi').duos).toContain('kite-header');
    expect(at('ch4-group-brazil').duos).not.toContain('chrey-lightning');
    expect(at('ch4-group-nigeria').duos).toEqual(ALL_DUOS);
  });

  it('reads a stage by where it stands, and plays everything with no place or past the end', () => {
    const save = newSave();
    const stage = stageOf(save, CHAPTERS, TEAMS);

    expect(systemsForStage(stage)).toEqual(systemsAt(stage.at));
    expect(systemsForStage({})).toMatchObject({ passCombo: true, roleSkills: true, chains: true });
    expect(systemsForSave({ ...save, chapter: CHAPTERS.length, stage: 0 }).duos).toEqual(ALL_DUOS);
    expect(systemsForSave(save)).toEqual(systemsAt({ chapter: 0, stage: 0 }));
  });
});
