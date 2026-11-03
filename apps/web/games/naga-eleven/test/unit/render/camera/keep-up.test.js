import { describe, expect, it } from 'vitest';
import { WORLD_VIEW } from '../../../../src/config.js';
import { BALL } from '../../../../src/data/tuning.js';
import { createCamera, project } from '../../../../src/render/camera.js';
import { railOf } from '../../../../src/render/camera/brakes.js';
import { HARD } from '../../../../src/render/camera/keep-in-view.js';
import { flightAt, keepUpAcceleration } from '../../../../src/render/camera/keep-up.js';
import { matchOf } from './fixture.js';

const CALM = { along: 0.23, depth: 0.37 };

function cameraAt(x, y = 540) {
  const camera = createCamera(matchOf('11'));

  camera.pan = null;
  Object.assign(camera.along, { value: x, velocity: 0, pace: 0 });
  Object.assign(camera.depth, { value: y, velocity: 0, pace: 0 });

  return camera;
}

const needOf = (camera, ball) =>
  keepUpAcceleration({ camera, ball, rail: railOf(camera), calm: CALM });

describe('flightAt', () => {
  const pitch = { length: 1800, width: 1080 };

  it('slows a rolling ball more than one in the air', () => {
    const rolling = flightAt({ x: 0, y: 500, vx: 10, vy: 0, z: 0 }, 30, pitch);
    const flying = flightAt({ x: 0, y: 500, vx: 10, vy: 0, z: 20, vz: 2 }, 30, pitch);

    expect(rolling.x).toBeLessThan(flying.x);
    expect(flying.x).toBeLessThan(300);
    expect(flightAt({ x: 5, y: 7, vx: 0, vy: 0 }, 30, pitch)).toEqual({ x: 5, y: 7 });
  });

  it('stops where the ground around the pitch ends, as the sim stops a ball that went out', () => {
    const out = flightAt({ x: 1700, y: 1000, vx: 15, vy: 9, z: 0 }, 40, pitch);

    expect(out).toEqual({ x: pitch.length + BALL.runoff, y: pitch.width + BALL.runoff });
  });
});

describe('keepUpAcceleration', () => {
  it('asks nothing for a ball standing still, in the middle or near the edge', () => {
    const camera = cameraAt(900);

    expect(needOf(camera, { x: 900, y: 540, vx: 0, vy: 0 })).toEqual({ along: 0, depth: 0 });
    expect(needOf(camera, { x: 1520, y: 540, vx: 0, vy: 0 })).toEqual({ along: 0, depth: 0 });
  });

  it('asks nothing for a pass the calm camera keeps in the middle of the view anyway', () => {
    expect(needOf(cameraAt(900), { x: 900, y: 540, vx: 4, vy: 0 }).along).toBe(0);
  });

  it('asks enough for a ball struck hard to stay inside the view, short of a whip', () => {
    const camera = cameraAt(700);
    const ball = { x: 950, y: 900, vx: 16, vy: 0, z: 10, vz: 3 };
    const need = needOf(camera, ball).along;

    for (let ticks = 1; ticks <= 45; ticks += 1) {
      const seen = { ...camera, along: { value: 700 + (need * ticks * (ticks + 1)) / 2 } };
      const at = flightAt(ball, ticks, camera.bounds);
      const drawn = project(seen, at.x, at.y);

      expect(drawn.x).toBeLessThanOrEqual(WORLD_VIEW.width - HARD.side);
    }

    expect(need).toBeGreaterThan(CALM.along);
    expect(need).toBeLessThan(1);
  });

  it('asks nothing for a shot into the goal the camera at the end of its rail already shows', () => {
    const camera = cameraAt(railOf(cameraAt(0)).along.high);

    expect(needOf(camera, { x: 1500, y: 540, vx: 15, vy: 0, z: 0 }).along).toBe(0);
  });

  it('asks the camera to tilt sooner for a ball flying toward the near touchline', () => {
    const camera = cameraAt(900, railOf(cameraAt(0)).depth.low);

    expect(needOf(camera, { x: 900, y: 700, vx: 0, vy: 12, z: 0 }).depth).toBeGreaterThan(0);
  });
});
