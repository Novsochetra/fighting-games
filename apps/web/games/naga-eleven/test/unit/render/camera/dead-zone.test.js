import { describe, expect, it } from 'vitest';
import { createCamera, project } from '../../../../src/render/camera.js';
import { DEAD_ZONE, holdInside, stepAim } from '../../../../src/render/camera/dead-zone.js';
import { FOCUS_ROW } from '../../../../src/render/camera/lens.js';
import { WORLD_VIEW } from '../../../../src/config.js';
import { matchOf } from './fixture.js';

// where a point would be drawn once the camera has come to rest on its aim
function drawnFromAim(camera, point) {
  const resting = { ...camera, along: { value: camera.aim.x }, depth: { value: camera.aim.y } };

  return project(resting, point.x, point.y);
}

describe('holdInside', () => {
  it('keeps what is held while the point is within reach, else moves it just enough', () => {
    expect(holdInside(100, 130, 50)).toBe(100);
    expect(holdInside(100, 170, 50)).toBe(120);
    expect(holdInside(100, 20, 50)).toBe(70);
  });
});

describe('the aim of the camera', () => {
  it('holds still while the ball stays inside the window in the middle of the view', () => {
    const match = matchOf();
    const camera = createCamera(match);
    const start = { ...camera.aim };

    for (const [dx, dy] of [
      [40, 0],
      [-60, 30],
      [20, -50],
    ]) {
      stepAim(camera, { x: start.x + dx, y: start.y + dy });

      expect(camera.aim).toEqual(start);
    }
  });

  it('moves only as far as puts a ball outside it back on its edge', () => {
    const match = matchOf();
    const camera = createCamera(match);
    const ball = { x: camera.aim.x + 300, y: camera.aim.y + 420 };

    stepAim(camera, ball);

    const drawn = drawnFromAim(camera, ball);

    expect(drawn.x - WORLD_VIEW.width / 2).toBeCloseTo(DEAD_ZONE.side);
    expect(drawn.y - FOCUS_ROW).toBeCloseTo(DEAD_ZONE.down);
  });

  it('tilts up to a ball by the far touchline as far as the window and the venue allow', () => {
    const match = matchOf('7');
    const camera = createCamera(match);
    const ball = { x: camera.aim.x, y: 40 };

    stepAim(camera, ball);

    expect(FOCUS_ROW - drawnFromAim(camera, ball).y).toBeLessThanOrEqual(DEAD_ZONE.up + 0.01);
    expect(camera.aim.y).toBeGreaterThanOrEqual(camera.bounds.minY);
  });

  it('stays inside the ground the camera may see, so a ball coming back moves it at once', () => {
    const match = matchOf();
    const camera = createCamera(match);

    stepAim(camera, { x: -400, y: camera.aim.y });

    const atEnd = camera.aim.x;

    stepAim(camera, { x: -350, y: camera.aim.y });

    expect(atEnd).toBeGreaterThan(0);
    expect(camera.aim.x).toBe(atEnd);

    stepAim(camera, { x: atEnd + 300, y: camera.aim.y });

    expect(camera.aim.x).toBeGreaterThan(atEnd);
  });
});
