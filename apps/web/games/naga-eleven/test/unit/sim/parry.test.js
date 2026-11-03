import { describe, expect, it } from 'vitest';
import { bounceBack, parry, punchOut } from '../../../src/sim/parry.js';
import { matchInPlay } from '../../support/match-driver.js';

function shotAtTheKeeper() {
  const match = matchInPlay();
  const keeper = match.players[0];

  Object.assign(match.ball, {
    owner: null,
    x: 30,
    y: 540,
    z: 10,
    vx: -12,
    vy: 1,
    vz: 0,
    kick: 'shot',
  });

  return { match, keeper };
}

describe('a ball the keeper does not hold', () => {
  it('is parried away, punched further and wider, or bounces back off a wall', () => {
    for (const push of [parry, punchOut, bounceBack]) {
      const { match, keeper } = shotAtTheKeeper();

      push(match, keeper);

      expect(match.ball.lastTouch, push.name).toBe(keeper.index);
      expect(match.ball.kick).toBeNull();
      expect(keeper.noPickup).toBeGreaterThan(0);
    }

    const punched = shotAtTheKeeper();
    const walled = shotAtTheKeeper();

    punchOut(punched.match, punched.keeper);
    bounceBack(walled.match, walled.keeper);

    expect(Math.abs(punched.match.ball.vy)).toBeGreaterThan(Math.abs(walled.match.ball.vy));
    expect(walled.match.ball.vx).toBeGreaterThan(0);
  });
});
