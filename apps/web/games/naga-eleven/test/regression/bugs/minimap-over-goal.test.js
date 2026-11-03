import { describe, expect, it } from 'vitest';
import { UI_SCALE } from '../../../src/config.js';
import { createCamera, project } from '../../../src/render/camera.js';
import { FOCUS_ROW, groundAtRow, rowAt, scaleAt } from '../../../src/render/camera/lens.js';
import { minimapRect } from '../../../src/render/hud/layout.js';
import { minimapAlpha } from '../../../src/render/hud/minimap-fade.js';
import { fixtureMatch } from '../../integration/render/actors/match-fixture.js';

// The minimap was opaque glass in the top corner, and the goal being attacked passed under it: its
// crossbar, its net and the keeper's head hidden behind the radar. It fades while the ball or a goal
// is under it, and only then, now at the foot of the view, where the near side of play passes.
function cameraLookingAt(match, { x, y }) {
  const camera = createCamera(match);

  camera.pan = null;
  Object.assign(camera.along, { value: x, velocity: 0 });
  Object.assign(camera.depth, { value: y, velocity: 0 });

  return camera;
}

// a camera that puts a world point (lifted by `lift`) under the middle of the minimap
function cameraPutting(match, point, lift = 0) {
  const rect = minimapRect(match);
  const target = {
    x: (rect.x + rect.width / 2) * UI_SCALE,
    y: (rect.y + rect.height / 2) * UI_SCALE,
  };
  const camera = cameraLookingAt(match, { x: match.pitch.length / 2, y: match.pitch.width / 2 });
  const drawn = project(camera, point.x, point.y);

  camera.along.value += (drawn.x - target.x) / scaleAt(camera.lens, point.y);
  camera.depth.value = groundAtRow(
    camera.lens,
    FOCUS_ROW + rowAt(camera.lens, point.y, lift) - target.y,
  );

  return camera;
}

describe('the minimap over the play', () => {
  it('is clear glass while nothing that matters is under it', () => {
    const match = fixtureMatch({ format: '11' });
    const camera = cameraLookingAt(match, { x: match.pitch.length / 2, y: match.pitch.width / 2 });

    expect(minimapAlpha(camera, match)).toBe(1);
  });

  it('fades while the ball is under it', () => {
    const match = fixtureMatch({ format: '11' });
    const ball = { ...match.ball, x: 900, y: match.pitch.width - 30, z: 0 };
    const camera = cameraPutting(match, ball);

    expect(minimapAlpha(camera, { ...match, ball })).toBeLessThan(0.5);
  });

  it('fades while a goal is under it, the ball far off', () => {
    const match = fixtureMatch({ format: '11' });
    const crossbar = { x: match.pitch.length, y: match.pitch.width / 2 + match.goal.width / 2 };
    const camera = cameraPutting(match, crossbar, match.goal.height);
    const ball = { ...match.ball, x: 200, y: 60, z: 0 };

    expect(minimapAlpha(camera, { ...match, ball })).toBeLessThan(0.5);
  });
});
