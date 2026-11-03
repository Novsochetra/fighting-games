import { describe, expect, it } from 'vitest';
import { createCamera, project } from '../../../../src/render/camera.js';
import { cutOnJump, isJump, JUMP_DISTANCE } from '../../../../src/render/camera/cut.js';
import { WORLD_VIEW } from '../../../../src/config.js';
import { matchOf } from './fixture.js';

function cameraAt(x) {
  const camera = createCamera(matchOf());

  Object.assign(camera.along, { value: x, velocity: 3 });
  Object.assign(camera.aim, { x, y: camera.depth.value });
  Object.assign(camera.lead, { x: 80, run: 20, attack: 60 });
  camera.seen = { x, y: camera.depth.value };

  return camera;
}

describe('a cut to a new shot', () => {
  it('is for a jump no ball in play flies in a tick', () => {
    expect(isJump({ x: 0, y: 0 }, { x: 17, y: 4 })).toBe(false);
    expect(isJump({ x: 0, y: 0 }, { x: JUMP_DISTANCE, y: 1 })).toBe(true);
  });

  it('centres on a ball set down out of view, still, with no lead', () => {
    const camera = cameraAt(500);
    const ball = { x: 1300, y: camera.depth.value };

    expect(cutOnJump(camera, ball)).toBe(true);
    expect(project(camera, ball.x, ball.y).x).toBeCloseTo(WORLD_VIEW.width / 2);
    expect(camera.along.velocity).toBe(0);
    expect(camera.aim.x).toBe(camera.along.value);
    expect(camera.lead).toEqual({ x: 0, run: 0, attack: 0 });
  });

  it('is not made for a jump that lands in view, a ball in flight or the first look', () => {
    const camera = cameraAt(900);

    expect(cutOnJump(camera, { x: 1000, y: camera.depth.value })).toBe(false);
    expect(cutOnJump(camera, { x: 1015, y: camera.depth.value })).toBe(false);

    camera.seen = null;

    expect(cutOnJump(camera, { x: 1700, y: camera.depth.value })).toBe(false);
    expect(camera.along.value).toBe(900);
  });
});
