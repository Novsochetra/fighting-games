import { describe, expect, it } from 'vitest';
import { dribbleWayOf, roomAheadOf } from '../../../../src/sim/brains/dribbling.js';
import { holdBallAt, matchInPlay, only } from '../../../support/match-driver.js';

describe('the computer dribbling', () => {
  it('runs straight up the pitch with nobody in the way', () => {
    const match = matchInPlay();
    const carrier = holdBallAt(match, { x: 600, y: 540 }, match.players[6]);

    only(match, [6]);

    expect(dribbleWayOf(match, carrier).x).toBeCloseTo(1);
    expect(roomAheadOf(match, carrier)).toBe(1);
  });

  it('bends round an opponent in front', () => {
    const match = matchInPlay();
    const carrier = holdBallAt(match, { x: 600, y: 540 }, match.players[6]);

    only(match, [6, 17]);
    Object.assign(match.players[17], { x: 660, y: 545, stun: 0 });

    expect(Math.abs(dribbleWayOf(match, carrier).y)).toBeGreaterThan(0.3);
    expect(roomAheadOf(match, carrier)).toBeLessThan(0.5);
  });

  it('keeps off the touchline', () => {
    const match = matchInPlay();
    const carrier = holdBallAt(match, { x: 600, y: 1070 }, match.players[6]);

    only(match, [6]);
    carrier.facing = { x: 0, y: 1 };

    expect(dribbleWayOf(match, carrier).y).toBeLessThanOrEqual(0.01);
  });

  it('heads for goal in the last third', () => {
    const match = matchInPlay();
    const carrier = holdBallAt(match, { x: 1500, y: 300 }, match.players[6]);

    only(match, [6]);

    expect(dribbleWayOf(match, carrier).y).toBeGreaterThan(0.3);
  });
});
