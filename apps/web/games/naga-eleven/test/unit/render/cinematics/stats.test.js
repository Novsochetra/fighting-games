import { describe, expect, it } from 'vitest';
import {
  countEvents,
  createMatchStats,
  goalsOf,
  possessionShare,
} from '../../../../src/render/cinematics/boards/stats.js';
import { scorerLines } from '../../../../src/render/cinematics/boards/scorers.js';
import { statRows } from '../../../../src/render/cinematics/boards/stat-rows.js';

// players 0 and 1 play for team 0, 2 and 3 for team 1
function matchOf({ phase = 'play', owner = null, minute = 12 } = {}) {
  return {
    phase,
    minute,
    half: 1,
    ball: { owner },
    players: [
      { index: 0, team: 0, name: 'Dara', number: 1 },
      { index: 1, team: 0, name: { en: 'Sochetra', km: 'សុចិត្រា' }, number: 10 },
      { index: 2, team: 1, name: 'Haruto', number: 10 },
      { index: 3, team: 1, name: null, number: 4 },
    ],
  };
}

describe('the match stats', () => {
  it('count shots, saves and passes for the side of who made them', () => {
    const stats = createMatchStats();

    countEvents(
      stats,
      [
        { type: 'shot', player: 1, power: 0.8, move: null },
        { type: 'shot', player: 2, power: 1, move: 'silent-moon' },
        { type: 'shot', player: 2, power: 0.4, move: null },
        { type: 'save', keeper: 0, parried: true },
        { type: 'pass', player: 1 },
        { type: 'pass', player: 3 },
        { type: 'pass', player: 0 },
      ],
      matchOf(),
    );

    expect(stats.shots).toEqual([1, 2]);
    expect(stats.saves).toEqual([1, 0]);
    expect(stats.passes).toEqual([2, 1]);
  });

  it('count only the tackles that won the ball, and duels for the side that won them', () => {
    const stats = createMatchStats();

    countEvents(
      stats,
      [
        { type: 'tackle', player: 2, target: 1, won: true },
        { type: 'tackle', player: 0, target: 2, won: false },
        { type: 'duelEnd', duel: { outcome: { winner: 0 } } },
        { type: 'duelEnd', duel: { outcome: { winner: 0 } } },
        { type: 'duel', duel: { outcome: null } },
      ],
      matchOf(),
    );

    expect(stats.tacklesWon).toEqual([0, 1]);
    expect(stats.duelsWon).toEqual([2, 0]);
  });

  it('count possession by ticks of play with the ball at a side’s feet', () => {
    const stats = createMatchStats();

    for (let i = 0; i < 30; i += 1) {
      countEvents(stats, [], matchOf({ owner: 1 }));
    }

    for (let i = 0; i < 10; i += 1) {
      countEvents(stats, [], matchOf({ owner: 2 }));
      countEvents(stats, [], matchOf({ owner: null }));
      countEvents(stats, [], matchOf({ owner: 2, phase: 'restart' }));
    }

    expect(stats.possession).toEqual([30, 10]);
    expect(possessionShare(stats)).toEqual([75, 25]);
  });

  it('share possession evenly before anyone has had the ball, always to a hundred', () => {
    const stats = createMatchStats();

    expect(possessionShare(stats)).toEqual([50, 50]);
    stats.possession = [1, 2];
    expect(possessionShare(stats).reduce((sum, share) => sum + share, 0)).toBe(100);
  });

  it('keep each goal with its minute and a copy of its scorer’s name', () => {
    const stats = createMatchStats();
    const match = matchOf({ minute: 23.7 });

    countEvents(stats, [{ type: 'goal', team: 0, scorer: 1, move: 'naga-shot' }], match);
    match.players[1].name.en = 'Changed';
    countEvents(stats, [{ type: 'goal', team: 1, scorer: null, move: null }], matchOf());

    expect(goalsOf(stats, 0)).toEqual([
      {
        team: 0,
        scorer: 1,
        name: { en: 'Sochetra', km: 'សុចិត្រា' },
        number: 10,
        minute: 23,
        half: 1,
        move: 'naga-shot',
      },
    ]);
    expect(goalsOf(stats, 1)[0]).toMatchObject({ scorer: null, name: null, minute: 12 });
  });

  it('show a goal in the first minute as the first minute', () => {
    const stats = createMatchStats();

    countEvents(stats, [{ type: 'goal', team: 0, scorer: 1 }], matchOf({ minute: 0 }));

    expect(stats.goals[0].minute).toBe(1);
  });

  it('take no events, or none known, without a fuss', () => {
    const stats = createMatchStats();

    countEvents(stats, undefined, null);
    countEvents(stats, [{ type: 'whistle', kind: 'kickoff' }, { type: 'out' }], matchOf());

    expect(stats).toEqual({ ...createMatchStats(), possession: [0, 0] });
  });
});

describe('the board lines', () => {
  it('list a player who scored twice once, with both minutes, and own goals apart', () => {
    const goals = [
      { team: 0, scorer: 1, name: { en: 'Sochetra', km: 'សុចិត្រា' }, minute: 23 },
      { team: 0, scorer: null, name: null, minute: 40 },
      { team: 0, scorer: 1, name: { en: 'Sochetra', km: 'សុចិត្រា' }, minute: 67 },
      { team: 0, scorer: 3, name: null, number: 4, minute: 70 },
    ];

    expect(scorerLines(goals)).toEqual(["SOCHETRA 23' 67'", "OWN GOAL 40'", "#4 70'"]);
    expect(scorerLines(goals, 'km')[0]).toBe("សុចិត្រា 23' 67'");
  });

  it('put possession as percentages and the rest as counts, in board order', () => {
    const stats = { ...createMatchStats(), possession: [3, 1], shots: [4, 2] };
    const rows = statRows(stats);

    expect(rows.map((row) => row.key)).toEqual([
      'possession',
      'shots',
      'saves',
      'passes',
      'tacklesWon',
      'duelsWon',
    ]);
    expect(rows[0].words).toEqual(['75%', '25%']);
    expect(rows[1].words).toEqual(['4', '2']);
  });
});
