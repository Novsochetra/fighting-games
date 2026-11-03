import { describe, expect, it } from 'vitest';
import { AI } from '../../../../src/data/tuning.js';
import { supportIntent } from '../../../../src/sim/brains/support.js';
import { planTeams } from '../../../../src/sim/team-plan.js';
import { distance } from '../../../../src/sim/vector.js';
import { holdBallAt, matchInPlay, playTicks } from '../../../support/match-driver.js';

describe('the side with the ball off it', () => {
  it('picks spots now and then and runs to them', () => {
    const match = matchInPlay(3, { humanTeam: null });

    holdBallAt(match, { x: 800, y: 540 }, match.players[6]);
    planTeams(match);

    const mate = match.players[7];
    const first = supportIntent(match, mate);

    expect(mate.spot).not.toBe(null);
    expect(first.move.x !== 0 || first.move.y !== 0 || distance(mate, mate.spot) < 4).toBe(true);
  });

  it('spreads out rather than bunching on the ball', () => {
    const match = matchInPlay(3, { humanTeam: null });

    holdBallAt(match, { x: 800, y: 540 }, match.players[6]);
    playTicks(match, AI.spotEvery * 3);

    const mates = match.sides[0].filter((player) => player.role !== 'keeper');
    const nearBall = mates.filter((player) => distance(player, match.ball) < 60);

    expect(nearBall.length).toBeLessThanOrEqual(3);
  });
});
