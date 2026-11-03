import { describe, expect, it } from 'vitest';
import { KEEPER } from '../../../../src/data/tuning.js';
import { distributeIntent } from '../../../../src/sim/brains/distribution.js';
import { holdBallAt, matchInPlay, only } from '../../../support/match-driver.js';

describe('the keeper with the ball', () => {
  it('holds it a moment facing up the pitch, then plays it out', () => {
    const match = matchInPlay();
    const keeper = holdBallAt(match, { x: 30, y: 540 }, match.players[0]);

    only(match, [0, 2]);
    Object.assign(match.players[2], { x: 260, y: 700, stun: 0 });

    expect(distributeIntent(match, keeper).action).toBe(null);
    expect(keeper.facing).toEqual({ x: 1, y: 0 });

    keeper.holding = KEEPER.hold;

    expect(distributeIntent(match, keeper).action).toMatchObject({ kind: 'pass', target: 2 });
  });

  it('kicks it long with no mate free', () => {
    const match = matchInPlay();
    const keeper = holdBallAt(match, { x: 30, y: 540 }, match.players[0]);

    only(match, [0]);
    keeper.holding = KEEPER.hold;

    expect(distributeIntent(match, keeper).action.kind).toBe('clear');
  });
});
