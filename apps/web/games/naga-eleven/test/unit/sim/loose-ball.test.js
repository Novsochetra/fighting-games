import { describe, expect, it } from 'vitest';
import { PLAYER } from '../../../src/data/tuning.js';
import { dropOf, isLoose, updateDropSpot } from '../../../src/sim/loose-ball.js';
import { predictBall } from '../../../src/sim/flight.js';
import { looseBallAt, matchInPlay } from '../../support/match-driver.js';

describe('a loose ball', () => {
  it('is one nobody has, nobody was played and that is not a shot on its way', () => {
    const match = matchInPlay();

    looseBallAt(match, { x: 600, y: 400, vx: 3, kick: 'clear' });
    expect(isLoose(match)).toBe(true);

    match.players[5].receiving = 20;
    expect(isLoose(match)).toBe(false);

    match.players[5].receiving = 0;
    match.ball.kick = 'shot';
    expect(isLoose(match)).toBe(false);
  });

  it('marks where a high ball comes down to head height, and when', () => {
    const match = matchInPlay();

    looseBallAt(match, { x: 600, y: 400, z: 20, vx: 4, vz: 6, kick: 'clear' });

    const drop = dropOf(match);
    const there = predictBall(match.ball, drop.ticks);

    expect(drop.ticks).toBeGreaterThan(30);
    expect(drop.x).toBeCloseTo(there.x);
    expect(there.z).toBeLessThan(PLAYER.headHeight);
  });

  it('marks nothing for a ball on the grass, one owned, or one coming down off the pitch', () => {
    const match = matchInPlay();

    looseBallAt(match, { x: 600, y: 400, vx: 4 });
    updateDropSpot(match);
    expect(match.dropSpot).toBe(null);

    looseBallAt(match, { x: 600, y: 30, z: 20, vy: -6, vz: 6, kick: 'clear' });
    expect(dropOf(match)).toBe(null);
  });
});
