import { describe, expect, it } from 'vitest';
import { newSave } from '../../../src/campaign/save.js';
import { stageOf } from '../../../src/campaign/stage-view.js';
import { DEFAULT_STRENGTH } from '../../../src/campaign/team-strength.js';
import { FIXTURE_CHAPTERS, FIXTURE_TEAMS } from '../../support/campaign-fixtures.js';

const at = (chapter, stage, teams = FIXTURE_TEAMS) =>
  stageOf({ ...newSave(), chapter, stage }, FIXTURE_CHAPTERS, teams);

describe('the current stage', () => {
  it('is the stage itself, with where it stands in the story', () => {
    const stage = at(0, 3);

    expect(stage).toMatchObject(FIXTURE_CHAPTERS[0].stages[3]);
    expect(stage.at).toMatchObject({
      chapter: 0,
      stage: 3,
      stageCount: 6,
      chapterId: 'chapter-1',
      chapterNumber: 1,
      team: 'village-school',
      format: '7',
      heroAge: 'child',
      group: null,
    });
    expect(stage.at.cup).toMatchObject({ id: 'kids-cup', kind: 'knockout' });
  });

  it('has no cup for a friendly or a scene', () => {
    expect(at(0, 2).at.cup).toBeNull();
    expect(at(0, 0).at.cup).toBeNull();
  });

  it('is none once the campaign is over', () => {
    expect(stageOf({ ...newSave(), chapter: 3 }, FIXTURE_CHAPTERS)).toBeNull();
  });

  it('heals a save that points past the end of its chapter', () => {
    expect(at(0, 12).at).toMatchObject({ chapter: 1, stage: 0 });
  });
});

describe('a group stage', () => {
  it("knows the group's teams, the hero's opponents in order and its place among them", () => {
    const { group } = at(2, 2).at;

    expect(group).toMatchObject({
      teams: ['nation-youth', 'dragon-youth', 'tiger-youth', 'eagle-youth'],
      opponents: ['dragon-youth', 'tiger-youth', 'eagle-youth'],
      round: 1,
      first: 1,
      last: false,
      advance: 2,
      failScene: 'c3-asia-cup-fail',
    });
    expect(at(2, 4).at.group).toMatchObject({ round: 2, last: true });
  });

  it("carries each team's strength from its players", () => {
    const { strengths } = at(2, 1).at.group;

    expect(strengths['dragon-youth']).toBe(80);
    expect(strengths['tiger-youth']).toBe(58);
  });

  it('gives every team the same strength when no teams are passed', () => {
    const { strengths } = at(2, 1, null).at.group;

    expect(new Set(Object.values(strengths))).toEqual(new Set([DEFAULT_STRENGTH]));
  });
});
