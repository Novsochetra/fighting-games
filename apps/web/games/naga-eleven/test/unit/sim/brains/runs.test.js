import { describe, expect, it } from 'vitest';
import { AI } from '../../../../src/data/tuning.js';
import { startRun } from '../../../../src/sim/brains/runs.js';
import { planTeams } from '../../../../src/sim/team-plan.js';
import { holdBallAt, matchInPlay, only } from '../../../support/match-driver.js';

describe('a run in behind', () => {
  it('takes a forward beyond the last defender when a mate on the ball has time', () => {
    let runs = 0;

    for (let seed = 1; seed <= 40; seed += 1) {
      const match = matchInPlay(seed, { humanTeam: null });

      holdBallAt(match, { x: 700, y: 540 }, match.players[6]);
      only(match, [6, 9, 13, 14]);
      Object.assign(match.players[9], { x: 1000, y: 540, stun: 0 });
      Object.assign(match.players[13], { x: 1050, y: 450, stun: 0 });
      Object.assign(match.players[14], { x: 1050, y: 650, stun: 0 });
      planTeams(match);

      if (startRun(match, match.players[9])) {
        runs += 1;
        expect(match.players[9].run).toBe(AI.runTicks);
        expect(match.players[9].spot.x).toBeGreaterThan(1100);
      }
    }

    expect(runs).toBeGreaterThan(0);
  });

  it('is never made by a defender, nor when the other side has the ball', () => {
    const match = matchInPlay(1, { humanTeam: null });

    holdBallAt(match, { x: 700, y: 540 }, match.players[17]);
    planTeams(match);

    for (let i = 0; i < 200; i += 1) {
      expect(startRun(match, match.players[9])).toBe(false);
      expect(startRun(match, match.players[2])).toBe(false);
    }
  });
});
