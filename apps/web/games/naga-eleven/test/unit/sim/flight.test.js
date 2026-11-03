import { describe, expect, it } from 'vitest';
import { BALL, KICK } from '../../../src/data/tuning.js';
import { createBall, stepBall } from '../../../src/sim/ball.js';
import { createMatch } from '../../../src/sim/create-match.js';
import {
  climbsOutOfReach,
  groundSpeedFor,
  liftFor,
  loftFor,
  loftTicksFor,
  predictBall,
  ticksToCover,
} from '../../../src/sim/flight.js';

function flyFor(match, ticks) {
  for (let i = 0; i < ticks; i += 1) {
    stepBall(match);
  }

  return match.ball;
}

describe('a ball struck along the grass', () => {
  it('is struck harder the further it must go, within the pass speeds', () => {
    expect(groundSpeedFor(300)).toBeGreaterThan(groundSpeedFor(100));
    expect(groundSpeedFor(0)).toBeGreaterThanOrEqual(KICK.passMin);
    expect(groundSpeedFor(5000)).toBe(KICK.passMax);
  });
});

describe('a ball struck in the air', () => {
  it('comes down where it was aimed, after the ticks it was given', () => {
    const match = createMatch({ seed: 1 });
    const ticks = 50;
    const { speed, lift } = loftFor(400, ticks);

    Object.assign(match.ball, createBall(match), { x: 100, y: 300, vx: speed, vz: lift });
    flyFor(match, ticks);

    expect(match.ball.x).toBeCloseTo(500, 0);
    expect(match.ball.z).toBeLessThan(BALL.gravity * 4);
  });

  it('flies longer the further it goes', () => {
    expect(loftTicksFor(800)).toBeGreaterThan(loftTicksFor(200));
  });

  it('reaches a height it was aimed at over a distance', () => {
    const match = createMatch({ seed: 1 });
    const lift = liftFor(12, 240, 30);

    Object.assign(match.ball, createBall(match), { x: 0, vx: 12, vz: lift });
    flyFor(match, ticksToCover(12, 240));

    expect(match.ball.z).toBeCloseTo(30, 0);
  });
});

describe('where the ball will be', () => {
  it('follows the ball as it flies', () => {
    const match = createMatch({ seed: 1 });

    Object.assign(match.ball, createBall(match), { x: 200, y: 300, vx: 6, vy: -2, z: 10, vz: 3 });

    const guess = predictBall(match.ball, 12);
    const ball = flyFor(match, 12);

    expect(guess.x).toBeCloseTo(ball.x, 3);
    expect(guess.y).toBeCloseTo(ball.y, 3);
    expect(guess.z).toBeCloseTo(ball.z, 3);
  });
});

describe('a ball out of an outfield player’s reach', () => {
  it('is one climbing past the chest, or coming down above the head', () => {
    expect(climbsOutOfReach({ z: 40, vz: 2, kick: 'shot' })).toBe(true);
    expect(climbsOutOfReach({ z: 20, vz: 2, kick: 'shot' })).toBe(false);
    expect(climbsOutOfReach({ z: 40, vz: -2, kick: 'shot' })).toBe(false);
  });

  it('is a lofted pass all the way up, even off the foot, but not a low bounce of it', () => {
    expect(climbsOutOfReach({ z: 6, vz: KICK.chipRise + 1, kick: 'pass' })).toBe(true);
    expect(climbsOutOfReach({ z: 20, vz: 1, kick: 'pass' })).toBe(true);
    expect(climbsOutOfReach({ z: 6, vz: KICK.chipRise - 1, kick: 'pass' })).toBe(false);
  });
});
