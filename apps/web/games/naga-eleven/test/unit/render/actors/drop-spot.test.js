import { describe, expect, it } from 'vitest';
import { BALL, PLAYER } from '../../../../src/data/tuning.js';
import { dropSpotOf, ticksToLand } from '../../../../src/render/actors/drop-spot.js';
import { predictBall } from '../../../../src/sim/flight.js';

const ball = (fields) => ({
  x: 400,
  y: 300,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  owner: null,
  inGoal: null,
  ...fields,
});

const matchWith = (fields, extra = {}) => ({ phase: 'play', ball: ball(fields), ...extra });

// the sim's own step of a ball in the air: drag, gravity, then the move
function landingByStepping(start) {
  const flying = { ...start };

  for (let tick = 1; tick < 400; tick += 1) {
    flying.vx *= BALL.airDrag;
    flying.vy *= BALL.airDrag;
    flying.vz -= BALL.gravity;
    flying.x += flying.vx;
    flying.y += flying.vy;
    flying.z += flying.vz;

    if (flying.z <= 0) {
      return { tick, x: flying.x, y: flying.y };
    }
  }

  return null;
}

describe('the ticks a ball has left to fall', () => {
  it.each([
    { z: 0, vz: 5 },
    { z: 60, vz: 2.5 },
    { z: 90, vz: -1 },
    { z: 3, vz: -4 },
  ])('come to the tick the sim puts it on the grass, from $z up at $vz', (flight) => {
    const start = ball({ ...flight, vx: 4, vy: -1.5 });

    expect(ticksToLand(start)).toBe(landingByStepping(start).tick);
  });
});

describe("a high ball's drop spot", () => {
  it('is where the sim would bring it down, and how soon', () => {
    const match = matchWith({ z: 40, vz: 3, vx: 5, vy: 1 });
    const spot = dropSpotOf(match);
    const landing = landingByStepping(match.ball);

    expect(spot.ticks).toBe(landing.tick);
    expect(spot.x).toBeCloseTo(landing.x, 6);
    expect(spot.y).toBeCloseTo(landing.y, 6);
    expect(predictBall(match.ball, spot.ticks).z).toBe(0);
  });

  it('is foreseen for a ball falling from high, though now under the chest', () => {
    const falling = Math.sqrt(2 * BALL.gravity * (PLAYER.chestHeight + 30));

    expect(dropSpotOf(matchWith({ z: 20, vz: -falling, vx: 3 }))).not.toBeNull();
  });

  it('is none for a ball held, rolling, skimming low, in the net or out of play', () => {
    expect(dropSpotOf(matchWith({ z: 50, vz: 2, owner: 3 }))).toBeNull();
    expect(dropSpotOf(matchWith({ z: 0, vz: 0, vx: 6 }))).toBeNull();
    expect(dropSpotOf(matchWith({ z: 4, vz: 1.5, vx: 9 }))).toBeNull();
    expect(dropSpotOf(matchWith({ z: 50, vz: 2, inGoal: 1 }))).toBeNull();
    expect(dropSpotOf(matchWith({ z: 50, vz: 2 }, { phase: 'restart' }))).toBeNull();
  });

  it("is the sim's own when the match keeps one, even none", () => {
    const kept = { x: 120, y: 80, ticks: 30 };

    expect(dropSpotOf(matchWith({ z: 0 }, { dropSpot: kept }))).toBe(kept);
    expect(dropSpotOf(matchWith({ z: 50, vz: 2 }, { dropSpot: null }))).toBeNull();
  });
});
