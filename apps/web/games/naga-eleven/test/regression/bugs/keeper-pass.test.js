import { describe, expect, it } from 'vitest';
import { bestPassOf } from '../../../src/sim/brains/pass-options.js';
import { holdBallAt, matchInPlay, only, playTicks, playUntil } from '../../support/match-driver.js';

// the player's keeper with the ball in his hands was the computer's: he waited, then rolled it to
// whoever he picked himself, so the player could never choose who got it
const DOWN_RIGHT = { pass: true, down: true, right: true };

function keeperWithBall(seed) {
  const match = matchInPlay(seed, { format: '11' });
  const keeper = holdBallAt(match, { x: 40, y: 540 }, match.players[0]);
  const upField = Object.assign(match.players[9], { x: 500, y: 300, vx: 0, vy: 0, stun: 0 });
  const aimedAt = Object.assign(match.players[2], { x: 250, y: 800, vx: 0, vy: 0, stun: 0 });

  only(match, [keeper.index, upField.index, aimedAt.index]);

  return { match, keeper, upField, aimedAt };
}

describe('the player’s keeper with the ball in his hands', () => {
  it.each([1, 2, 3])('throws it to the mate the stick points at (seed %i)', (seed) => {
    const { match, keeper, upField, aimedAt } = keeperWithBall(seed);

    expect(bestPassOf(match, keeper).target).toBe(upField.index);

    playTicks(match, 1, { held: DOWN_RIGHT, pressed: { pass: true } });
    playTicks(match, 1, { held: { ...DOWN_RIGHT, pass: false } });

    expect(aimedAt.receiving).toBeGreaterThan(0);
    expect(match.controlled).toBe(aimedAt.index);
    expect(playUntil(match, (each) => each.ball.owner === aimedAt.index, 200)).toBe(true);
  });

  it('kicks it long to a mate up the pitch on a held pass', () => {
    const { match, upField } = keeperWithBall(4);
    const held = { pass: true, right: true, up: true };

    playTicks(match, 1, { held, pressed: { pass: true } });
    playTicks(match, 24, { held });
    playTicks(match, 1, { held: { ...held, pass: false } });

    expect(upField.receiving).toBeGreaterThan(0);
    expect(match.ball.vz).toBeGreaterThan(1);
  });
});
