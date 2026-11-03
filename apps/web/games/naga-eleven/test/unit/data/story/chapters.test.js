import { describe, expect, it } from 'vitest';
import { chapterProblems } from '../../../../src/campaign/index.js';
import { CHARACTERS } from '../../../../src/data/characters.js';
import { MOVES } from '../../../../src/data/moves.js';
import { CHAPTERS } from '../../../../src/data/story/index.js';
import { TEAMS } from '../../../../src/data/teams/index.js';
import { BACKDROPS, CHAPTER_MOVES, DRILLS, MOVE_OWNERS, TEAM_KITS, VENUES } from './readme-ids.js';

const matchesOf = (chapter) => chapter.stages.filter((stage) => stage.kind === 'match');

const finalOf = (chapter) => matchesOf(chapter).at(-1);

const sceneIdsOf = (stage) => [
  stage.scene,
  stage.before,
  ...(typeof stage.after === 'string' ? [stage.after] : Object.values(stage.after ?? {})),
  ...(stage.triggers ?? []).map((trigger) => trigger.scene),
];

const namedScenes = (chapter) => [
  ...chapter.stages.flatMap(sceneIdsOf),
  ...Object.values(chapter.cups).map((cup) => cup.failScene),
];

const unlocksOf = (stage) => [
  ...(stage.rewards?.moves ?? []),
  ...(stage.triggers ?? []).map((trigger) => trigger.unlock),
];

const lines = (scene) => scene.lines.map((line) => line.text.en).join(' ');

const isRivalStar = (id) => CHARACTERS[id]?.role === 'rival';

const rivalsOf = (match) =>
  TEAMS[match.opponent].players.map((player) => player.star).filter(isRivalStar);

describe('the four chapters', () => {
  it('run in order, one format, team and age each, as the README sets them', () => {
    expect(CHAPTERS.map((chapter) => chapter.number)).toEqual([1, 2, 3, 4]);
    expect(CHAPTERS.map((chapter) => chapter.format)).toEqual(['7', '11', '11', '11']);
    expect(CHAPTERS.map((chapter) => chapter.heroAge)).toEqual(['child', 'teen', 'young', 'adult']);
    expect(CHAPTERS.map((chapter) => chapter.team)).toEqual([
      'chrey-school',
      'kampong-cham-high',
      'cambodia-youth',
      'cambodia',
    ]);
  });

  it('pass the campaign checks with no problems', () => {
    const known = {
      teams: TEAMS,
      venues: VENUES,
      backdrops: BACKDROPS,
      drills: DRILLS,
      moves: MOVES,
      characters: CHARACTERS,
    };

    for (const chapter of CHAPTERS) {
      expect(chapterProblems(chapter, known)).toEqual([]);
    }
  });

  it('name only scenes they have, and play every scene they have', () => {
    for (const chapter of CHAPTERS) {
      const named = namedScenes(chapter).filter(Boolean);

      expect(named.filter((id) => !chapter.scenes[id])).toEqual([]);
      expect(Object.keys(chapter.scenes).filter((id) => !named.includes(id))).toEqual([]);
    }
  });

  it('name each scene after its chapter, so no two chapters share a scene id', () => {
    for (const chapter of CHAPTERS) {
      const strays = Object.keys(chapter.scenes).filter(
        (id) => !id.startsWith(`ch${chapter.number}-`),
      );

      expect(strays).toEqual([]);
    }
  });

  it('train only in the README drills', () => {
    const drills = CHAPTERS.flatMap((chapter) =>
      chapter.stages.filter((stage) => stage.kind === 'training').map((stage) => stage.drill),
    );

    expect(drills.every((drill) => DRILLS.includes(drill))).toBe(true);
    expect(new Set(drills)).toEqual(new Set(DRILLS));
  });
});

describe('the matches', () => {
  const matches = CHAPTERS.flatMap((chapter) =>
    matchesOf(chapter).map((match) => [chapter, match]),
  );

  it('meet teams of their own chapter at README venues', () => {
    for (const [chapter, match] of matches) {
      expect(TEAMS[match.opponent]).toBeDefined();
      expect(TEAM_KITS[match.opponent][0]).toBe(chapter.number);
      expect(VENUES).toContain(match.venue);
    }
  });

  it('give every match a win and a lose scene, and a draw scene where it can end level', () => {
    for (const [, match] of matches) {
      expect(match.after.win).toBeTruthy();
      expect(match.after.lose).toBeTruthy();
      expect(Boolean(match.after.draw)).toBe(match.rule !== 'knockout');
    }
  });

  it('end every chapter with a knockout final against the rival who leads the opposition', () => {
    const finals = CHAPTERS.map(finalOf);

    expect(finals.map((match) => match.rule)).toEqual(Array(4).fill('knockout'));
    expect(finals.map((match) => match.opponent)).toEqual([
      'royal-kids',
      'phnom-penh-elite',
      'japan-youth',
      'brazil',
    ]);
  });

  it('play each cup the README way: ch 1 a knockout, then a group and two knockout rounds', () => {
    const groupSizes = CHAPTERS.map(
      (chapter) => matchesOf(chapter).filter((match) => match.rule === 'group').length,
    );
    const knockouts = CHAPTERS.map(
      (chapter) => matchesOf(chapter).filter((match) => match.rule === 'knockout').length,
    );

    expect(groupSizes).toEqual([0, 2, 3, 3]);
    expect(knockouts).toEqual([2, 2, 2, 2]);
    expect(matchesOf(CHAPTERS[0])[0].rule).toBe('friendly');
  });

  it('list group teams that exist, with the hero team among them', () => {
    for (const chapter of CHAPTERS) {
      const groups = Object.values(chapter.cups).filter((cup) => cup.kind === 'group');

      for (const cup of groups) {
        expect(cup.teams.every((id) => TEAMS[id])).toBe(true);
        expect(cup.teams).toContain(chapter.team);
        expect(cup.advance).toBe(2);
      }
    }
  });

  it('tell every final and every rival match with triggers, a duel with the rival among them', () => {
    const told = matches.filter(
      ([chapter, match]) => match === finalOf(chapter) || rivalsOf(match).length,
    );

    for (const [, match] of told) {
      const duels = match.triggers.filter((trigger) => trigger.when === 'firstDuel');

      expect(duels.map((trigger) => trigger.with)).toEqual(rivalsOf(match));
    }
  });

  it('wake the chapter move late in a final being lost, and fill the gauge', () => {
    const late = { 1: 32, 2: 75, 3: 75, 4: 75 };

    for (const chapter of CHAPTERS) {
      const wake = finalOf(chapter).triggers.find((trigger) => trigger.when === 'losingLate');
      const [move] = CHAPTER_MOVES[chapter.number].at(-1);

      expect(wake).toMatchObject({ minute: late[chapter.number], unlock: move, boost: 'spirit' });
      expect(finalOf(chapter).rewards.moves).toContain(move);
    }
  });
});

describe('the moves the story gives', () => {
  it("are only Sochetra's, each in the chapter and stage kind the README says", () => {
    for (const chapter of CHAPTERS) {
      const given = chapter.stages.flatMap((stage) =>
        unlocksOf(stage)
          .filter(Boolean)
          .map((move) => [move, stage.kind]),
      );

      expect(given.every(([move]) => MOVE_OWNERS[move] === 'sochetra')).toBe(true);
      expect(new Set(given.map((pair) => pair.join()))).toEqual(
        new Set(CHAPTER_MOVES[chapter.number].map((pair) => pair.join())),
      );
    }
  });
});

describe('losing once', () => {
  const openers = [
    [CHAPTERS[2], 'japan-youth', 'haruto'],
    [CHAPTERS[3], 'brazil', 'rafael'],
  ];

  it('opens the ch 3 and ch 4 groups against the rival the final is played against', () => {
    for (const [chapter, opponent] of openers) {
      const [opener] = matchesOf(chapter);

      expect(opener).toMatchObject({ rule: 'group', opponent });
      expect(finalOf(chapter).opponent).toBe(opponent);
    }
  });

  it('plays the rival above its table in the opener only, and in the final as the table has it', () => {
    const inForm = CHAPTERS.flatMap(matchesOf).filter(
      (match) => match.opponentForm || match.teamForm,
    );

    for (const [chapter] of openers) {
      const [opener] = matchesOf(chapter);

      expect(opener.opponentForm.stats, opener.id).toBeGreaterThan(0);
      expect(opener.teamForm?.stats ?? 0, opener.id).toBeLessThanOrEqual(0);
    }

    expect(inForm.map((match) => match.id)).toEqual(['ch3-group-japan', 'ch4-group-brazil']);
  });

  it('gives the opener a sad loss, and a rival not at full power after a win or a draw', () => {
    for (const [chapter, , rival] of openers) {
      const { after } = matchesOf(chapter)[0];
      const promise = (id) =>
        chapter.scenes[id].lines.some(
          (line) => line.speaker === rival && /full power.*final/i.test(line.text.en),
        );

      expect(chapter.scenes[after.lose].mood).toBe('sad');
      expect(promise(after.win)).toBe(true);
      expect(promise(after.draw)).toBe(true);
    }
  });

  it('sends the player to play a lost knockout or a lost group again', () => {
    for (const chapter of CHAPTERS) {
      const knockoutLosses = matchesOf(chapter)
        .filter((match) => match.rule === 'knockout')
        .map((match) => match.after.lose);
      const failScenes = Object.values(chapter.cups).map((cup) => cup.failScene);
      const again = [...knockoutLosses, ...failScenes].filter(Boolean);

      expect(again.filter((id) => !/again/i.test(lines(chapter.scenes[id])))).toEqual([]);
    }
  });
});
