import { describe, expect, it } from 'vitest';
import { arrivalSpot } from '../../../../src/sim/brains/arrivals.js';
import { holdBallAt, matchInPlay } from '../../../support/match-driver.js';

describe('arriving in the box', () => {
  it('sends the forwards to the posts and the spot, a midfielder to the edge, with a mate deep', () => {
    const match = matchInPlay();

    holdBallAt(match, { x: 1600, y: 950 }, match.players[8]);

    const centre = arrivalSpot(match, match.players[9]);
    const far = arrivalSpot(match, match.players[10]);
    const edge = arrivalSpot(match, match.players[6]);

    expect(centre.x).toBeGreaterThan(1550);
    expect(Math.abs(centre.y - 540)).toBeLessThan(10);
    expect(far.y).toBeLessThan(540);
    expect(edge.x).toBeLessThan(centre.x);
    expect(arrivalSpot(match, match.players[2])).toBe(null);
  });

  it('is nowhere with the ball far from goal', () => {
    const match = matchInPlay();

    holdBallAt(match, { x: 900, y: 540 }, match.players[8]);

    expect(arrivalSpot(match, match.players[9])).toBe(null);
  });
});
