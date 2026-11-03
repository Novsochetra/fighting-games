import { describe, expect, it } from 'vitest';
import { interceptOf, kick, runTo, standStill } from '../../../../src/sim/brains/steering.js';
import { looseBallAt, matchInPlay } from '../../../support/match-driver.js';

describe('steering', () => {
  it('runs at full stick to a far spot and eases into a near one', () => {
    const player = { x: 0, y: 0 };

    expect(runTo(player, { x: 100, y: 0 }).move).toEqual({ x: 1, y: 0 });
    expect(runTo(player, { x: 12, y: 0 }).move.x).toBeLessThan(1);
    expect(runTo(player, { x: 1, y: 0 })).toEqual(standStill());
  });

  it('stands still to kick', () => {
    expect(kick({ kind: 'pass' })).toMatchObject({
      move: { x: 0, y: 0 },
      action: { kind: 'pass' },
    });
  });

  it('meets a rolling ball ahead of it, sooner the nearer the player', () => {
    const match = matchInPlay();

    looseBallAt(match, { x: 500, y: 500, vx: 6 });

    const near = interceptOf(match, Object.assign(match.players[3], { x: 600, y: 520 }));
    const far = interceptOf(match, Object.assign(match.players[4], { x: 900, y: 700 }));

    expect(near.x).toBeGreaterThan(500);
    expect(near.ticks).toBeLessThan(far.ticks);
  });

  it('waits for a high ball to come down to where it can be played', () => {
    const match = matchInPlay();

    looseBallAt(match, { x: 500, y: 500, z: 40, vx: 6, vz: 6 });

    const spot = interceptOf(match, Object.assign(match.players[3], { x: 520, y: 500 }));

    expect(spot.x).toBeGreaterThan(700);
  });
});
