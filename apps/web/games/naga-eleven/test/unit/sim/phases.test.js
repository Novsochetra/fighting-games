import { describe, expect, it } from 'vitest';
import { PHASES } from '../../../src/sim/phases.js';
import { matchInPlay } from '../../support/match-driver.js';

describe('the phases of a match', () => {
  it('has a tick for each phase of the contract', () => {
    expect(Object.keys(PHASES).sort()).toEqual(
      ['duel', 'goal', 'halfTime', 'kickoff', 'over', 'play', 'restart', 'saveCam'].sort(),
    );
  });

  it('hands a duel to the duels each tick, and stands still with none attached', () => {
    const match = matchInPlay();
    const ticks = [];

    match.phase = 'duel';
    PHASES.duel(match);

    match.hooks = { duelTick: (each) => ticks.push(each.tick) };
    PHASES.duel(match);

    expect(ticks).toEqual([match.tick]);
  });
});
