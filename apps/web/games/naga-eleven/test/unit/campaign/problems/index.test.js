import { describe, expect, it } from 'vitest';
import { chapterProblems } from '../../../../src/campaign/problems/index.js';
import { FIXTURE_CHAPTERS, KNOWN, both } from '../../../support/campaign-fixtures.js';

const chapterWith = (index, change) => {
  const chapter = structuredClone(FIXTURE_CHAPTERS[index]);

  change(chapter);

  return chapter;
};

const problemsOf = (index, change) => chapterProblems(chapterWith(index, change), KNOWN);

describe('the problems of a sound chapter', () => {
  it('are none', () => {
    for (const chapter of FIXTURE_CHAPTERS) {
      expect(chapterProblems(chapter, KNOWN)).toEqual([]);
    }
  });

  it('are one for what is not a chapter', () => {
    expect(chapterProblems(null, KNOWN)).toEqual(['the chapter is not an object']);
  });
});

describe('the problems of a chapter', () => {
  it('name a broken head', () => {
    const problems = chapterProblems({ id: 'chapter-9', title: 'Plain', format: '9' }, KNOWN);

    expect(problems).toEqual(
      expect.arrayContaining([
        'chapter-9: no chapter number',
        'chapter-9: the title is not in both languages',
        "chapter-9: unknown format '9'",
        "chapter-9: unknown team 'undefined'",
        "chapter-9: unknown age 'undefined'",
        'chapter-9: no stages',
        'chapter-9: no scenes',
      ]),
    );
  });

  it("name a team that plays another format than the chapter's", () => {
    expect(problemsOf(0, (chapter) => (chapter.format = '11'))).toContain(
      "chapter-1: team 'village-school' plays another format than 11",
    );
  });

  it('name a stage of an unknown kind, a scene stage with no scene and an unknown drill', () => {
    const problems = problemsOf(0, (chapter) => {
      chapter.stages[0] = { kind: 'cutscene' };
      chapter.stages[1].drill = 'juggling';
      chapter.stages.push({ kind: 'scene' });
    });

    expect(problems).toEqual(
      expect.arrayContaining([
        "chapter-1 stage 1 (cutscene): unknown kind 'cutscene'",
        "chapter-1 stage 2 (juggling): unknown drill 'juggling'",
        'chapter-1 stage 7 (scene): a scene stage names its scene',
      ]),
    );
  });

  it('name a scene that is played but never written, and one written but never played', () => {
    const problems = problemsOf(0, (chapter) => {
      chapter.stages[2].after.win = 'c1-missing';
    });

    expect(problems).toEqual([
      "chapter-1 stage 3: no scene 'c1-missing'",
      'chapter-1 scene c1-3-win: never played',
    ]);
  });

  it('name broken lines and scenes', () => {
    const problems = problemsOf(0, (chapter) => {
      chapter.scenes['c1-1-scene'] = {
        backdrop: 'moon',
        mood: 'grim',
        lines: [{ speaker: 'ghost', mood: 'bored', side: 'up', text: 'only English' }],
      };
      chapter.scenes['c1-6-scene'].lines = [];
    });

    expect(problems).toEqual([
      "chapter-1 scene c1-1-scene: unknown backdrop 'moon'",
      "chapter-1 scene c1-1-scene: unknown mood 'grim'",
      "chapter-1 scene c1-1-scene line 1: unknown speaker 'ghost'",
      "chapter-1 scene c1-1-scene line 1: unknown mood 'bored'",
      "chapter-1 scene c1-1-scene line 1: unknown side 'up'",
      'chapter-1 scene c1-1-scene line 1: the text is not in both languages',
      'chapter-1 scene c1-6-scene: no lines',
    ]);
  });

  it('check only against the lists given', () => {
    const chapter = chapterWith(0, (each) => (each.stages[2].venue = 'moon-base'));

    expect(chapterProblems(chapter, {})).toEqual([]);
    expect(chapterProblems(chapter, KNOWN)).toEqual([
      "chapter-1 stage 3 (m3): unknown venue 'moon-base'",
    ]);
  });

  it('take the lists as ids, objects with ids, Sets or objects keyed by id', () => {
    const venues = [new Set(['field']), [{ id: 'field' }], { field: {} }];

    for (const known of venues) {
      expect(chapterProblems(FIXTURE_CHAPTERS[0], { ...KNOWN, venues: known })).toEqual([]);
    }
  });

  it('name bad rewards', () => {
    const problems = problemsOf(0, (chapter) => {
      chapter.stages[4].rewards = { xp: -3, moves: ['moon-kick'] };
    });

    expect(problems).toEqual([
      'chapter-1 stage 5 (m5): rewards.xp is a number of 0 or more',
      'chapter-1 stage 5 (m5): unknown move among rewards moon-kick',
    ]);
  });
});

describe('the problems of a cup', () => {
  it('name a cup with no name in both languages or of an unknown kind', () => {
    const problems = problemsOf(0, (chapter) => {
      chapter.cups['kids-cup'] = { name: 'Kids Cup', kind: 'league' };
    });

    expect(problems).toEqual(
      expect.arrayContaining([
        'chapter-1 cup kids-cup: the name is not in both languages',
        "chapter-1 cup kids-cup: unknown kind 'league'",
      ]),
    );
  });

  it('name a group that cannot work', () => {
    const problems = problemsOf(2, (chapter) => {
      Object.assign(chapter.cups['asia-cup'], {
        advance: 4,
        teams: [...chapter.cups['asia-cup'].teams, 'mars-youth'],
      });
      delete chapter.cups['asia-cup'].failScene;
      delete chapter.scenes['c3-asia-cup-fail'];
    });

    expect(problems).toEqual([
      'chapter-3 cup asia-cup: unknown team among nation-youth, dragon-youth, tiger-youth, eagle-youth, mars-youth',
      'chapter-3 cup asia-cup: a group has a failScene',
      "chapter-3 cup asia-cup: the hero's team meets each other team of the group once",
    ]);
  });

  it('name an advance that is not under the number of teams', () => {
    expect(problemsOf(1, (chapter) => (chapter.cups['school-champ'].advance = 3))).toEqual([
      'chapter-2 cup school-champ: advance is at least 1 and under the number of teams',
    ]);
  });
});

describe('the problems of a match', () => {
  it('name a match without id, rule, cup, opponent, venue or scenes', () => {
    const problems = problemsOf(0, (chapter) => {
      chapter.stages[3] = { kind: 'match', rule: 'cup', opponent: 'village-school', round: 'Semi' };
    });

    expect(problems).toEqual(
      expect.arrayContaining([
        'chapter-1 stage 4 (match): a match has an id',
        "chapter-1 stage 4 (match): unknown rule 'cup'",
        "chapter-1 stage 4 (match): no cup cup 'undefined' in the chapter",
        "chapter-1 stage 4 (match): the hero's team is the opponent",
        "chapter-1 stage 4 (match): unknown venue 'undefined'",
        'chapter-1 stage 4 (match): the round is not in both languages',
        'chapter-1 stage 4 (match): a match has a win and a lose scene',
        'chapter-1 stage 4 (match): a match that can end level has a draw scene',
      ]),
    );
  });

  it('name a knockout match whose cup is a group, and an opponent of another format', () => {
    const problems = problemsOf(1, (chapter) => {
      chapter.stages[4].cup = 'school-champ';
      chapter.stages[4].opponent = 'river-kids';
    });

    expect(problems).toEqual([
      "chapter-2 stage 5 (m5): no knockout cup 'school-champ' in the chapter",
      "chapter-2 stage 5 (m5): 'river-kids' plays another format",
    ]);
  });

  it('name broken triggers', () => {
    const problems = problemsOf(0, (chapter) => {
      chapter.stages[4].triggers = [
        { when: 'teatime', scene: 'c1-5-before' },
        { when: 'losingLate', scene: 'c1-5-before' },
        { when: 'kickoff' },
        { when: 'specialGoal', move: 'moon-kick', unlock: 'sun-kick', boost: 'rage' },
        { when: 'firstDuel', with: 'ghost', boost: 'spirit' },
      ];
    });

    expect(problems).toEqual([
      "chapter-1 stage 5 (m5) trigger 1: unknown 'teatime'",
      "chapter-1 stage 5 (m5) trigger 2: 'losingLate' needs minute",
      'chapter-1 stage 5 (m5) trigger 3: does nothing: no scene, unlock or boost',
      "chapter-1 stage 5 (m5) trigger 4: unknown move 'sun-kick'",
      "chapter-1 stage 5 (m5) trigger 4: unknown move 'moon-kick'",
      "chapter-1 stage 5 (m5) trigger 4: unknown boost 'rage'",
      "chapter-1 stage 5 (m5) trigger 5: unknown character 'ghost'",
    ]);
  });

  it('name triggers that are not a list', () => {
    expect(problemsOf(0, (chapter) => (chapter.stages[4].triggers = {}))).toEqual([
      'chapter-1 stage 5 (m5): triggers is not a list',
    ]);
  });

  it('name a broken form for either side', () => {
    const problems = problemsOf(2, (chapter) => {
      chapter.stages[1].opponentForm = { stats: 20, spirit: 5 };
      chapter.stages[2].teamForm = 'nervous';
      chapter.stages[4].opponentForm = { stats: 0 };
      chapter.stages[6].teamForm = { stats: 2.5 };
    });

    expect(problems).toEqual([
      'chapter-3 stage 2 (m2): unknown opponentForm field spirit',
      'chapter-3 stage 2 (m2): opponentForm.stats is a whole number from -15 to 15, not 0',
      'chapter-3 stage 3 (m3): teamForm is not an object',
      'chapter-3 stage 5 (m5): opponentForm.stats is a whole number from -15 to 15, not 0',
      'chapter-3 stage 7 (m7): teamForm.stats is a whole number from -15 to 15, not 0',
    ]);
  });

  it('accept an opponent above its table and a side below its own', () => {
    const forms = { opponentForm: { stats: 10 }, teamForm: { stats: -3 } };

    expect(problemsOf(2, (chapter) => Object.assign(chapter.stages[1], forms))).toEqual([]);
  });

  it('accept a round written in both languages', () => {
    expect(problemsOf(0, (chapter) => (chapter.stages[4].round = both('Final')))).toEqual([]);
  });
});
