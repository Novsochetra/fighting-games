import { describe, expect, it } from 'vitest';
import {
  createLedger,
  recordEvents,
  recordUnlock,
  resultOf,
} from '../../../../src/ui/flow/match-ledger.js';

const match = {
  humanTeam: 0,
  minute: 33,
  players: [
    { id: 'sochetra', star: 'sochetra', team: 0 },
    { id: 'dara', star: 'dara', team: 0 },
    { id: 'haruto', star: 'haruto', team: 1 },
  ],
};

describe('the match ledger', () => {
  it('counts the goals each way, and the ones Sochetra scored', () => {
    const ledger = createLedger(0);

    recordEvents(ledger, match, [
      { type: 'goal', team: 1, scorer: 2, move: 'silent-moon' },
      { type: 'pass', player: 0 },
      { type: 'goal', team: 0, scorer: 0, move: 'naga-shot' },
      { type: 'goal', team: 0, scorer: 1, move: null },
    ]);

    expect(resultOf(ledger)).toMatchObject({ goalsFor: 2, goalsAgainst: 1, goalsBySochetra: 1 });
    expect(resultOf(ledger).goals[1]).toEqual({
      team: 0,
      scorer: 'sochetra',
      move: 'naga-shot',
      minute: 33,
      byHero: true,
    });
  });

  it('counts the duels the player’s side won, and keeps each move woken once', () => {
    const ledger = createLedger(0);

    recordEvents(ledger, match, [
      { type: 'duelEnd', duel: { outcome: { winner: 0 } } },
      { type: 'duelEnd', duel: { outcome: { winner: 1 } } },
    ]);
    recordUnlock(ledger, 'naga-shot');
    recordUnlock(ledger, 'naga-shot');

    expect(resultOf(ledger, { penalties: { for: 4, against: 3 } })).toMatchObject({
      duelsWon: 1,
      unlocked: ['naga-shot'],
      penalties: { for: 4, against: 3 },
    });
  });
});
