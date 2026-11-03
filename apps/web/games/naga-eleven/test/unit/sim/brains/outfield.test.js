import { describe, expect, it } from 'vitest';
import { challengeSpotOf, shadowSpotOf } from '../../../../src/sim/brains/hunting.js';
import { outfieldIntent } from '../../../../src/sim/brains/outfield.js';
import { planTeams } from '../../../../src/sim/team-plan.js';
import { holdBallAt, looseBallAt, matchInPlay } from '../../../support/match-driver.js';

describe('an outfield player of the computer’s', () => {
  it('chases a loose ball when they are the side’s fastest to it', () => {
    const match = matchInPlay(2, { humanTeam: null });

    looseBallAt(match, { x: 900, y: 540, lastTouch: 4 });
    planTeams(match);

    const chaser = match.players[match.plans[0].chaser];
    const intent = outfieldIntent(match, chaser);
    const toBall = { x: match.ball.x - chaser.x, y: match.ball.y - chaser.y };

    expect(intent.move.x * toBall.x + intent.move.y * toBall.y).toBeGreaterThan(0);
  });

  it('stays goal side of the star he hunts, even while his own side has the ball', () => {
    const match = matchInPlay(2, { humanTeam: null });
    const star = Object.assign(match.players[9], { star: 'sochetra', x: 1200, y: 540 });
    const rival = Object.assign(match.players[20], { hunts: 'sochetra', x: 1300, y: 700 });

    holdBallAt(match, { x: 1500, y: 300 }, match.players[16]);
    planTeams(match);

    const intent = outfieldIntent(match, rival);
    const spot = shadowSpotOf(match, rival, star);
    const toSpot = { x: spot.x - rival.x, y: spot.y - rival.y };

    expect(match.plans[1].attacking).toBe(true);
    expect(intent.move.x * toSpot.y - intent.move.y * toSpot.x).toBeCloseTo(0);
    expect(intent.move.x * toSpot.x + intent.move.y * toSpot.y).toBeGreaterThan(0);
  });

  it('steps into the way of the star he hunts once the star has the ball', () => {
    const match = matchInPlay(2, { humanTeam: null });
    const star = holdBallAt(match, { x: 1200, y: 540 }, match.players[9]);
    const rival = Object.assign(match.players[20], { hunts: 'sochetra', x: 1300, y: 700 });

    star.star = 'sochetra';
    planTeams(match);

    const intent = outfieldIntent(match, rival);
    const spot = challengeSpotOf(match, star);
    const toSpot = { x: spot.x - rival.x, y: spot.y - rival.y };

    expect(match.plans[1].pressers[0]).toBe(rival.index);
    expect(intent.sprint).toBe(true);
    expect(intent.move.x * toSpot.y - intent.move.y * toSpot.x).toBeCloseTo(0);
    expect(intent.move.x * toSpot.x + intent.move.y * toSpot.y).toBeGreaterThan(0);
  });
});
