import { describe, expect, it } from 'vitest';
import { checkTriggers, createWatch } from '../../../src/story/watch.js';
import { duel, fakeMatch, goal, whistle } from '../../support/story-fixtures.js';

const scenesFired = (triggers, match, events) =>
  checkTriggers(createWatch(triggers), match, events).map((fired) => fired.scene);

describe('triggers at the whistle', () => {
  it('fires kickoff at the opening kickoff and not at one after a goal', () => {
    const trigger = [{ when: 'kickoff', scene: 'start' }];

    expect(scenesFired(trigger, fakeMatch(), [])).toEqual(['start']);
    expect(scenesFired(trigger, fakeMatch({ phase: 'play' }), [whistle('kickoff')])).toEqual([
      'start',
    ]);
    expect(scenesFired(trigger, fakeMatch({ score: [1, 0] }), [])).toEqual([]);
    expect(scenesFired(trigger, fakeMatch({ half: 2, phase: 'play' }), [])).toEqual([]);
  });

  it('fires halfTime at the half-time whistle or in the break', () => {
    const trigger = [{ when: 'halfTime', scene: 'half' }];

    expect(scenesFired(trigger, fakeMatch({ phase: 'play' }), [whistle('halfTime')])).toEqual([
      'half',
    ]);
    expect(scenesFired(trigger, fakeMatch({ phase: 'halfTime' }), [])).toEqual(['half']);
    expect(scenesFired(trigger, fakeMatch({ phase: 'play' }), [])).toEqual([]);
  });

  it('fires secondHalf once the second half is under way', () => {
    const trigger = [{ when: 'secondHalf', scene: 'second' }];

    expect(scenesFired(trigger, fakeMatch({ half: 2, phase: 'halfTime' }), [])).toEqual([]);
    expect(scenesFired(trigger, fakeMatch({ half: 2, phase: 'kickoff' }), [])).toEqual(['second']);
    expect(scenesFired(trigger, fakeMatch(), [whistle('kickoff', 2)])).toEqual(['second']);
    expect(scenesFired(trigger, fakeMatch({ phase: 'play' }), [whistle('kickoff', 1)])).toEqual([]);
  });
});

describe('triggers on a duel', () => {
  it('fires firstDuel at the first duel of Sochetra with the named rival only', () => {
    const trigger = [{ when: 'firstDuel', with: 'rithy', scene: 'rival' }];
    const match = fakeMatch({ phase: 'duel' });

    expect(scenesFired(trigger, match, [duel(6, 12)])).toEqual([]);
    expect(scenesFired(trigger, match, [duel(3, 13)])).toEqual([]);
    expect(scenesFired(trigger, match, [duel(6, 13)])).toEqual(['rival']);
    expect(scenesFired(trigger, match, [duel(13, 6)])).toEqual(['rival']);
  });

  it('finds the rival however the duel names its players', () => {
    const trigger = [{ when: 'firstDuel', with: 'farhad', scene: 'rival' }];
    const match = fakeMatch({ phase: 'duel' });

    match.players[7].star = 'farhad';

    const listed = { type: 'duel', duel: { players: [{ index: 6 }, { index: 7 }] } };
    const shot = { type: 'duel', duel: { shooter: 6, keeper: 7 } };
    const mateShot = { type: 'duel', duel: { shooter: 4, keeper: 7 } };

    expect(scenesFired(trigger, match, [listed])).toEqual(['rival']);
    expect(scenesFired(trigger, match, [shot])).toEqual(['rival']);
    expect(scenesFired(trigger, match, [mateShot])).toEqual([]);
  });

  it('fires at any first duel when it names nobody', () => {
    const trigger = [{ when: 'firstDuel', scene: 'any' }];

    expect(scenesFired(trigger, fakeMatch(), [duel(6, 12)])).toEqual(['any']);
    expect(scenesFired(trigger, fakeMatch(), [])).toEqual([]);
  });
});

describe('triggers on a goal', () => {
  it('tells a goal for the player’s side from one against it', () => {
    const triggers = [
      { when: 'goalFor', scene: 'for' },
      { when: 'goalAgainst', scene: 'against' },
    ];

    expect(scenesFired(triggers, fakeMatch({ score: [1, 0] }), [goal(0, 6)])).toEqual(['for']);
    expect(scenesFired(triggers, fakeMatch({ score: [0, 1] }), [goal(1, 13)])).toEqual(['against']);
  });

  it('reads the sides from the team the human plays', () => {
    const trigger = [{ when: 'goalFor', scene: 'for' }];
    const match = fakeMatch({ humanTeam: 1, score: [0, 1] });

    expect(scenesFired(trigger, match, [goal(1, 13)])).toEqual(['for']);
    expect(scenesFired(trigger, match, [goal(0, 6)])).toEqual([]);
  });

  it('fires first only on a side’s opening goal', () => {
    const trigger = [{ when: 'goalAgainst', first: true, scene: 'behind' }];

    expect(scenesFired(trigger, fakeMatch({ score: [0, 1] }), [goal(1)])).toEqual(['behind']);
    expect(scenesFired(trigger, fakeMatch({ score: [0, 2] }), [goal(1)])).toEqual([]);
  });

  it('fires by only on a goal the named player scores', () => {
    const trigger = [{ when: 'goalFor', by: 'sochetra', scene: 'hero' }];
    const match = fakeMatch({ score: [1, 0] });

    expect(scenesFired(trigger, match, [goal(0, 4)])).toEqual([]);
    expect(scenesFired(trigger, match, [goal(0, null)])).toEqual([]);
    expect(scenesFired(trigger, match, [goal(0, 6)])).toEqual(['hero']);
  });

  it('fires specialGoal on a goal scored with the named move', () => {
    const trigger = [{ when: 'specialGoal', move: 'naga-shot', scene: 'naga' }];
    const match = fakeMatch({ score: [1, 0] });

    expect(scenesFired(trigger, match, [goal(0, 6)])).toEqual([]);
    expect(scenesFired(trigger, match, [goal(0, 6, 'power-shot')])).toEqual([]);
    expect(scenesFired(trigger, match, [goal(0, 6, 'naga-shot')])).toEqual(['naga']);
    expect(scenesFired([{ when: 'specialGoal', scene: 'any' }], match, [goal(1, 13, 'x')])).toEqual(
      ['any'],
    );
  });
});

describe('triggers late in a match', () => {
  const losingLate = [{ when: 'losingLate', minute: 30, scene: 'naga' }];
  const drawLate = [{ when: 'drawLate', minute: 30, scene: 'push' }];

  it('fires losingLate only when behind after the minute', () => {
    const late = { phase: 'play', half: 2, minute: 31 };

    expect(scenesFired(losingLate, fakeMatch({ ...late, score: [0, 1] }), [])).toEqual(['naga']);
    expect(scenesFired(losingLate, fakeMatch({ ...late, minute: 30, score: [1, 2] }), [])).toEqual([
      'naga',
    ]);
    expect(scenesFired(losingLate, fakeMatch({ ...late, minute: 29, score: [0, 1] }), [])).toEqual(
      [],
    );
    expect(scenesFired(losingLate, fakeMatch({ ...late, score: [1, 1] }), [])).toEqual([]);
    expect(scenesFired(losingLate, fakeMatch({ ...late, score: [2, 1] }), [])).toEqual([]);
  });

  it('reads behind from the human side', () => {
    const match = fakeMatch({ phase: 'play', minute: 35, humanTeam: 1, score: [0, 1] });

    expect(scenesFired(losingLate, match, [])).toEqual([]);
    expect(scenesFired(losingLate, { ...match, score: [1, 0] }, [])).toEqual(['naga']);
  });

  it('waits out a duel, half time and the end', () => {
    for (const phase of ['duel', 'halfTime', 'over']) {
      expect(scenesFired(losingLate, fakeMatch({ phase, minute: 38, score: [0, 1] }), [])).toEqual(
        [],
      );
    }
  });

  it('fires drawLate only when level after the minute', () => {
    const late = { phase: 'play', minute: 33 };

    expect(scenesFired(drawLate, fakeMatch({ ...late, score: [2, 2] }), [])).toEqual(['push']);
    expect(scenesFired(drawLate, fakeMatch({ ...late, score: [0, 1] }), [])).toEqual([]);
    expect(scenesFired(drawLate, fakeMatch({ ...late, minute: 10, score: [0, 0] }), [])).toEqual(
      [],
    );
  });

  it('calls three quarters of the way through late when no minute is named', () => {
    const trigger = [{ when: 'losingLate', scene: 'late' }];
    const seven = { phase: 'play', format: '7', score: [0, 1] };
    const eleven = { phase: 'play', format: '11', score: [0, 1] };

    expect(scenesFired(trigger, fakeMatch({ ...seven, minute: 29 }), [])).toEqual([]);
    expect(scenesFired(trigger, fakeMatch({ ...seven, minute: 30 }), [])).toEqual(['late']);
    expect(scenesFired(trigger, fakeMatch({ ...eleven, minute: 60 }), [])).toEqual([]);
    expect(scenesFired(trigger, fakeMatch({ ...eleven, minute: 70 }), [])).toEqual(['late']);
  });

  it('fires minute once the clock reaches it', () => {
    const trigger = [{ when: 'minute', at: 20, scene: 'twenty' }];

    expect(scenesFired(trigger, fakeMatch({ phase: 'play', minute: 19 }), [])).toEqual([]);
    expect(scenesFired(trigger, fakeMatch({ phase: 'play', minute: 20 }), [])).toEqual(['twenty']);
    expect(scenesFired(trigger, fakeMatch({ phase: 'duel', minute: 21 }), [])).toEqual([]);
  });
});
