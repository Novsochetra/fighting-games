import { describe, expect, it } from 'vitest';

import {
  choosePenalty,
  createShootout,
  penaltyOptions,
  shootoutResult,
  stepShootout,
} from '../../../../src/sim/duel/index.js';
import { fakeMatch, statsOf } from '../../../support/duel-fixtures.js';

function playOut(shootout) {
  for (let i = 0; i < 200 && !shootout.over; i += 1) {
    stepShootout(shootout);
  }

  return shootoutResult(shootout);
}

describe('a penalty shootout', () => {
  it('takes five each at most before sudden death, and always ends with a winner', () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      const result = playOut(createShootout(fakeMatch({ seed, humanTeam: null })));

      expect(result.over).toBe(true);
      expect(result.goals[result.winner]).toBeGreaterThan(result.goals[1 - result.winner]);
      expect(Math.abs(result.taken[0] - result.taken[1])).toBeLessThanOrEqual(1);

      if (Math.max(...result.taken) > 5) {
        expect(result.taken[0]).toBe(result.taken[1]);
      }
    }
  });

  it('stops early once a side cannot catch up', () => {
    const shootout = createShootout(fakeMatch({ humanTeam: null }));

    shootout.kicks = [0, 1, 0, 1, 0, 1].map((team) => ({
      team,
      result: team === 0 ? 'scored' : 'missed',
    }));

    stepShootout(shootout);

    expect(shootoutResult(shootout)).toMatchObject({ over: true, winner: 0 });
  });

  it('sends the best shooters first, alternating sides', () => {
    const match = fakeMatch({ humanTeam: null });

    match.players[2].stats = statsOf(90);

    const shootout = createShootout(match);

    expect(shootout.pending).toMatchObject({ team: 0, shooter: 2, keeper: shootout.keepers[1] });

    stepShootout(shootout);

    expect(shootout.pending.team).toBe(1);
  });

  it("waits for the human's aim and dive", () => {
    const shootout = createShootout(fakeMatch({ humanTeam: 0 }));

    expect(stepShootout(shootout)).toBeNull();
    expect(choosePenalty(shootout, 'shoot', { aim: 1, power: 0.8 })).toBe(true);
    expect(choosePenalty(shootout, 'shoot', { aim: -1, power: 0.8 })).toBe(false);
    expect(stepShootout(shootout)).toMatchObject({ team: 0, aim: 1, power: 0.8 });
    expect(stepShootout(shootout)).toBeNull();
    expect(choosePenalty(shootout, 'keep', { dive: 0 })).toBe(true);
    expect(stepShootout(shootout)).toMatchObject({ team: 1, dive: 0 });
  });

  it('lets a better shooter score more often against a weaker keeper', () => {
    const rateFor = (shot, keeping) => {
      let scored = 0;

      for (let seed = 1; seed <= 300; seed += 1) {
        const match = fakeMatch({ seed, humanTeam: null });

        match.players.forEach((player) => {
          player.stats = {
            ...statsOf(50),
            shot: player.team === 0 ? shot : 50,
            keeping: player.team === 1 ? keeping : 50,
          };
        });

        const kick = stepShootout(createShootout(match));

        scored += kick.result === 'scored' ? 1 : 0;
      }

      return scored / 300;
    };

    expect(rateFor(90, 30)).toBeGreaterThan(rateFor(30, 90));
    expect(rateFor(99, 1)).toBeLessThan(1);
  });

  it('names the three aims for each side', () => {
    expect(penaltyOptions('shoot').map((option) => option.aim)).toEqual([-1, 0, 1]);
    expect(penaltyOptions('keep')[0].label.en).toBe('Dive left');
  });
});
