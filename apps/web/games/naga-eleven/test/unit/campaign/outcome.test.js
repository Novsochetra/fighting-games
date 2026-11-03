import { describe, expect, it } from 'vitest';
import { afterScene, outcomeOf, penaltiesWon, unlockedOf } from '../../../src/campaign/outcome.js';
import { matchResult } from '../../support/campaign-fixtures.js';

describe('the outcome of a match', () => {
  it('is a win, a draw or a loss by the goals', () => {
    expect(outcomeOf(matchResult(2, 1))).toBe('win');
    expect(outcomeOf(matchResult(1, 1))).toBe('draw');
    expect(outcomeOf(matchResult(0, 3))).toBe('lose');
    expect(outcomeOf({})).toBe('draw');
  });
});

describe('a shoot-out', () => {
  it('is won by a true flag or by more penalties scored', () => {
    expect(penaltiesWon(true)).toBe(true);
    expect(penaltiesWon(false)).toBe(false);
    expect(penaltiesWon({ goalsFor: 5, goalsAgainst: 4 })).toBe(true);
    expect(penaltiesWon({ goalsFor: 3, goalsAgainst: 4 })).toBe(false);
  });

  it('is lost when there was none', () => {
    expect(penaltiesWon(null)).toBe(false);
    expect(penaltiesWon(undefined)).toBe(false);
  });
});

describe('the scene after a match', () => {
  const stage = { after: { win: 'won', lose: 'lost', draw: 'level' } };

  it("is the outcome's own scene", () => {
    expect(afterScene(stage, 'win')).toBe('won');
    expect(afterScene(stage, 'lose')).toBe('lost');
    expect(afterScene(stage, 'draw')).toBe('level');
  });

  it('falls back from a missing draw scene to the lose scene, else to none', () => {
    expect(afterScene({ after: { win: 'won', lose: 'lost' } }, 'draw')).toBe('lost');
    expect(afterScene({}, 'win')).toBeNull();
  });
});

describe('the moves a match woke', () => {
  it('are a list whether one id or many came', () => {
    expect(unlockedOf({ unlocked: 'naga-shot' })).toEqual(['naga-shot']);
    expect(unlockedOf({ unlocked: ['a', 'b'] })).toEqual(['a', 'b']);
    expect(unlockedOf({})).toEqual([]);
  });
});
