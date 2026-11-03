import { describe, expect, it } from 'vitest';
import {
  groupTable,
  loadSave,
  newSave,
  progressSummary,
  quickMatchTeams,
  stageOf,
  storeSave,
  teamSpecFor,
} from '../../../src/campaign/index.js';
import {
  FIXTURE_CHAPTERS,
  FIXTURE_TEAMS,
  matchResult,
  memoryStorage,
  playCampaign,
  trainingResult,
} from '../../support/campaign-fixtures.js';

const win = (goalsFor = 2, goalsAgainst = 0, extra = {}) =>
  matchResult(goalsFor, goalsAgainst, { goalsBySochetra: 1, duelsWon: 1, ...extra });

// each match's results, one for each time it is played
const SCRIPT = {
  'chapter-1/m3': [matchResult(1, 1)],
  'chapter-1/m4': [matchResult(0, 1), win()],
  'chapter-1/m5': [matchResult(1, 2, { unlocked: ['naga-shot'] }), win(3, 2)],
  'chapter-2/m2': [win()],
  'chapter-2/m4': [win(1, 0)],
  'chapter-2/m5': [
    matchResult(1, 1, { penalties: false }),
    matchResult(2, 2, { penalties: { goalsFor: 4, goalsAgainst: 3 } }),
  ],
  'chapter-3/m2': [matchResult(0, 2)],
  'chapter-3/m3': [win(2, 1)],
  'chapter-3/m5': [win(3, 1)],
  'chapter-3/m6': [win()],
  'chapter-3/m7': [win(2, 1)],
};

function scripted(stage, save) {
  if (stage.kind === 'training') {
    return trainingResult(stage.drill, 'A', 2000);
  }

  return stage.kind === 'match' ? SCRIPT[`${stage.at.chapterId}/${stage.id}`][save.attempts] : {};
}

const journey = () =>
  playCampaign({ save: newSave({ seed: 7 }), chapters: FIXTURE_CHAPTERS, play: scripted });

const scenesShown = (log) => log.flatMap((entry) => entry.scenes);

describe('a whole campaign played through', () => {
  it('walks every chapter to the end, replaying the lost knockout matches', () => {
    const { save, log } = journey();
    const played = log.map(
      (entry) => `${entry.stage.at.chapterId}/${entry.stage.id ?? entry.stage.kind}`,
    );

    expect(stageOf(save, FIXTURE_CHAPTERS, FIXTURE_TEAMS)).toBeNull();
    expect(played.filter((id) => id === 'chapter-1/m5')).toHaveLength(2);
    expect(played.filter((id) => id === 'chapter-2/m5')).toHaveLength(2);
    expect(played.filter((id) => id === 'chapter-3/m2')).toHaveLength(1);
    expect(log).toHaveLength(22);
  });

  it('shows the scenes of each result, the great loss among them', () => {
    const scenes = scenesShown(journey().log);

    expect(scenes).toEqual(
      expect.arrayContaining(['c1-3-draw', 'c1-4-lose', 'c1-4-win', 'c1-5-lose', 'c1-5-win']),
    );
    expect(scenes).toContain('c3-2-lose');
    expect(scenes).toContain('c3-7-win');
    expect(scenes).not.toContain('c3-asia-cup-fail');
  });

  it('keeps the moves that woke, even in a lost final, and those the stages give', () => {
    const { save, log } = journey();
    const afterLostFinal = log.find((entry) => entry.stage.id === 'm5' && entry.outcome === 'lose');

    expect(afterLostFinal.save.hero.moves).toContain('naga-shot');
    expect(save.hero.moves).toEqual(['power-shot', 'naga-shot', 'twin-naga']);
  });

  it('puts the hero through the group he opened with a loss', () => {
    const { save } = journey();
    const table = groupTable(save, 'asia-cup');

    expect(table.map((row) => row.played)).toEqual([3, 3, 3, 3]);
    expect(table.findIndex((row) => row.team === 'nation-youth')).toBeLessThan(2);
    expect(table.find((row) => row.team === 'nation-youth')).toMatchObject({ won: 2, lost: 1 });
    expect(table[0].team).toBe('dragon-youth');
  });

  it('grows Sochetra chapter by chapter and never lets him fall back', () => {
    const { save, log } = journey();
    const levels = log.map((entry) => entry.before.hero.level);

    expect(levels).toEqual([...levels].sort((first, second) => first - second));
    expect(save.hero.level).toBeGreaterThan(20);
    expect(progressSummary(save, FIXTURE_CHAPTERS).finished).toBe(true);
  });

  it('carries on the same after being stored and loaded halfway', () => {
    const { log } = journey();
    const halfway = log[12].before;
    const storage = memoryStorage();

    storeSave(storage, halfway);

    const resumed = playCampaign({
      save: loadSave(storage),
      chapters: FIXTURE_CHAPTERS,
      play: scripted,
    });
    const straight = playCampaign({ save: halfway, chapters: FIXTURE_CHAPTERS, play: scripted });

    expect(resumed.save).toEqual(straight.save);
  });

  it('fills the quick match with the teams met, Sochetra at his final level', () => {
    const { save } = journey();
    const teams = quickMatchTeams(save, FIXTURE_TEAMS);
    const hero = teamSpecFor(save, 'nation-youth', FIXTURE_TEAMS).players[9];

    expect(teams).toHaveLength(FIXTURE_TEAMS.length);
    expect(hero.stats).toEqual(save.hero.stats);
  });
});

describe('a group lost', () => {
  // the group is lost the first time round and won when played again
  function groupScript(stage, save) {
    const secondTry = (save.cups['asia-cup']?.replays ?? 0) > 0 || save.attempts > 0;

    if (stage.at.chapter < 2 || stage.kind !== 'match') {
      return scripted(stage, save);
    }

    return stage.rule === 'group' && !secondTry ? matchResult(0, 3) : win();
  }

  const lostGroup = () =>
    playCampaign({ save: newSave({ seed: 7 }), chapters: FIXTURE_CHAPTERS, play: groupScript });

  it("shows the last match's scene and the fail scene, then plays the group from its start", () => {
    const { log } = lostGroup();
    const failedAt = log.findIndex((entry) => entry.scenes.includes('c3-asia-cup-fail'));
    const failed = log[failedAt];

    expect(failed.scenes).toEqual(['c3-5-lose', 'c3-asia-cup-fail']);
    expect(failed.passed).toBe(false);
    expect(failed.save).toMatchObject({ chapter: 2, stage: 1, attempts: 1 });
    expect(log[failedAt + 1].stage.id).toBe('m2');
  });

  it('keeps the lost table to show until the group starts again', () => {
    const { log } = lostGroup();
    const failed = log.find((entry) => entry.scenes.includes('c3-asia-cup-fail'));
    const table = groupTable(failed.save, 'asia-cup');

    expect(table.at(-1)).toMatchObject({ team: 'nation-youth', played: 3, lost: 3 });
  });

  it('counts only the new round when the group is played again', () => {
    const { save } = lostGroup();
    const hero = groupTable(save, 'asia-cup').find((row) => row.team === 'nation-youth');

    expect(save.cups['asia-cup'].replays).toBe(1);
    expect(hero).toMatchObject({ played: 3, won: 3 });
    expect(stageOf(save, FIXTURE_CHAPTERS)).toBeNull();
  });
});
