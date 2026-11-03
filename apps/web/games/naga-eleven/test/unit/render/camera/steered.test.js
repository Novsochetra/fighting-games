import { describe, expect, it } from 'vitest';
import { createCamera, project } from '../../../../src/render/camera.js';
import { frameSteered } from '../../../../src/render/camera/steered.js';
import { WORLD_VIEW } from '../../../../src/config.js';
import { matchOf } from './fixture.js';

// where a point is drawn once the camera has come to rest on its aim
function drawnFromAim(camera, point) {
  const resting = { ...camera, along: { value: camera.aim.x }, depth: { value: camera.aim.y } };

  return project(resting, point.x, point.y);
}

function steeredMatch(steeredAt) {
  const match = matchOf();

  Object.assign(match.players[0], steeredAt);
  Object.assign(match, { humanTeam: 0, controlled: 0 });

  return match;
}

describe('framing the player the human steers', () => {
  it('turns toward him until he is in view, when the view can hold him and the ball', () => {
    const match = steeredMatch({ x: 1600 });
    const camera = createCamera(match);

    frameSteered(camera, match);

    const steered = drawnFromAim(camera, match.players[0]);
    const ball = drawnFromAim(camera, match.ball);

    expect(steered.x).toBeLessThanOrEqual(WORLD_VIEW.width - 96 + 0.5);
    expect(ball.x).toBeGreaterThanOrEqual(300 - 0.5);
  });

  it('keeps the ball in view first when the two are too far apart', () => {
    const match = steeredMatch({ x: 2100 });
    const camera = createCamera(match);

    frameSteered(camera, match);

    expect(drawnFromAim(camera, match.ball).x).toBeCloseTo(300);
  });

  it('leaves the aim be when he is in view, or when the computer plays both sides', () => {
    const near = steeredMatch({ x: 1200 });
    const camera = createCamera(near);
    const start = { ...camera.aim };

    frameSteered(camera, near);

    expect(camera.aim).toEqual(start);

    const computer = Object.assign(steeredMatch({ x: 2100 }), { humanTeam: null });

    frameSteered(camera, computer);

    expect(camera.aim).toEqual(start);
  });
});
