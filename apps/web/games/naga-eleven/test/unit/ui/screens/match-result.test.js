import { describe, expect, it } from 'vitest';
import { goalsInOrder, outcomeOf, scorerName } from '../../../../src/ui/screens/match-result.js';
import { CHREY, ROYAL } from '../../../support/screen-fixtures.js';

describe('a match’s result as the player sees it', () => {
  it('reads the score from the player’s side', () => {
    expect(outcomeOf({ score: [2, 1] })).toBe('win');
    expect(outcomeOf({ score: [2, 1], side: 1 })).toBe('loss');
    expect(outcomeOf({ score: [0, 0] })).toBe('draw');
  });

  it('settles a draw by its penalties, and only a draw', () => {
    expect(outcomeOf({ score: [1, 1], penalties: { for: 3, against: 4 } })).toBe('loss');
    expect(outcomeOf({ score: [1, 1], penalties: { for: 5, against: 4 } })).toBe('win');
    expect(outcomeOf({ score: [2, 1], penalties: { for: 0, against: 5 } })).toBe('win');
  });

  it('names a star as the cast does, anyone else from their team, and nobody as nobody', () => {
    const teams = [CHREY, ROYAL];

    expect(scorerName(teams, { team: 1, scorer: 'rithy' })).toEqual({ en: 'Rithy', km: 'រិទ្ធី' });
    expect(scorerName(teams, { team: 0, scorer: 'chrey-school-4' })).toBe('Vuthy');
    expect(scorerName(teams, { team: 0, scorer: 'stranger' })).toBe('stranger');
    expect(scorerName(teams, { team: 0, scorer: null })).toBe(null);
  });

  it('lists the goals by the minute, leaving the record as it was', () => {
    const goals = [{ minute: 40 }, { minute: 3 }, { minute: 22 }];

    expect(goalsInOrder(goals).map((goal) => goal.minute)).toEqual([3, 22, 40]);
    expect(goals[0].minute).toBe(40);
    expect(goalsInOrder()).toEqual([]);
  });
});
