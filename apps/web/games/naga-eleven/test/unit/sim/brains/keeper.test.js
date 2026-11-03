import { describe, expect, it } from 'vitest';
import { KEEPER } from '../../../../src/data/tuning.js';
import { keeperIntent, startDive } from '../../../../src/sim/brains/keeper.js';
import { byStat } from '../../../../src/sim/stats.js';
import { holdBallAt, looseBallAt, matchInPlay, only } from '../../../support/match-driver.js';

describe('the keeper', () => {
  it('stands between the ball and the middle of the goal', () => {
    const match = matchInPlay();
    const keeper = Object.assign(match.players[0], { x: 20, y: 540 });

    holdBallAt(match, { x: 300, y: 300 }, match.players[19]);

    expect(keeperIntent(match, keeper).move.y).toBeLessThan(0);
  });

  it('moves across to where a shot will cross the line once they have seen it', () => {
    const match = matchInPlay();
    const keeper = Object.assign(match.players[0], { x: 16, y: 540 });
    const shooter = match.players[20];

    shooter.lastKick = match.tick - KEEPER.reaction[0];
    looseBallAt(match, { x: 300, y: 540, vx: -14, vy: 1.6, kick: 'shot', lastTouch: 20 });

    expect(keeperIntent(match, keeper).move.y).toBeGreaterThan(0.5);
  });

  it('dives at the last for a shot out of reach', () => {
    const match = matchInPlay();
    const keeper = Object.assign(match.players[0], { x: 16, y: 540 });

    match.players[20].lastKick = match.tick - 30;
    looseBallAt(match, { x: 120, y: 540, vx: -14, vy: 5, kick: 'shot', lastTouch: 20 });

    const intent = keeperIntent(match, keeper);

    expect(intent.action).toEqual({ kind: 'dive', side: 1 });

    startDive(match, keeper, intent.action);

    expect(keeper.dive).toEqual({ tick: match.tick, side: 1 });
    expect(keeper.vy).toBeGreaterThan(0);
  });

  it('comes off the line to claim a loose ball in the box first', () => {
    const match = matchInPlay();
    const keeper = Object.assign(match.players[0], { x: 16, y: 540 });

    only(match, [0, 20]);
    Object.assign(match.players[20], { x: 400, y: 540, stun: 0 });
    looseBallAt(match, { x: 120, y: 560, vx: -1 });

    expect(keeperIntent(match, keeper)).toMatchObject({ sprint: true });
    expect(keeperIntent(match, keeper).move.x).toBeGreaterThan(0.5);
  });

  it('reads some shots later than others: a late read leaves them standing', () => {
    const match = matchInPlay();
    const keeper = Object.assign(match.players[0], { x: 16, y: 540, stats: { keeping: 60 } });
    const seenAt = byStat(KEEPER.reaction, 60);

    match.players[20].lastKick = match.tick - Math.ceil(seenAt);
    looseBallAt(match, { x: 300, y: 540, vx: -14, vy: 1.6, kick: 'shot', lastTouch: 20 });

    match.ball.read = -KEEPER.readSpread;
    expect(keeperIntent(match, keeper).move.y).toBeGreaterThan(0.5);

    match.ball.read = KEEPER.readSpread;
    expect(keeperIntent(match, keeper).move).toEqual({ x: 0, y: 0 });
  });
});
