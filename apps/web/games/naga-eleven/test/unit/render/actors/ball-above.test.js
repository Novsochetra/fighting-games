import { describe, expect, it } from 'vitest';
import { UI_SCALE, WORLD_VIEW } from '../../../../src/config.js';
import { drawBallAbove, isAboveView } from '../../../../src/render/actors/ball-above.js';
import { createCamera } from '../../../../src/render/camera.js';
import { scaleAt } from '../../../../src/render/camera/lens.js';
import { hudBoxes } from '../../../../src/render/hud/layout.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

function cameraOver(match) {
  const camera = createCamera(match);

  camera.pan = null;
  camera.along.value = match.ball.x;

  return camera;
}

const drawsFor = (camera, match) => {
  const { context, calls } = createRecordingContext();

  drawBallAbove(context, camera, match);

  return calls.filter((call) => call.name === 'fillRect').map((call) => call.args);
};

// a ball high over the spot that is drawn at column `x` of the UI's view
function highBallUnder(camera, match, x) {
  const scale = scaleAt(camera.lens, match.ball.y);
  const worldX = camera.along.value + (x * UI_SCALE - WORLD_VIEW.width / 2) / scale;

  return { ...match, ball: { ...match.ball, x: worldX, z: 900 } };
}

const overlaps = ([x, y, width, height], box) =>
  x < box.x + box.width && x + width > box.x && y < box.y + box.height && y + height > box.y;

describe('a long ball over the top of the view', () => {
  it('is pinned to the top edge while it is up there, and shown no more once it drops in', () => {
    const match = fixtureMatch({ format: '11' });
    const camera = cameraOver(match);
    const high = { ...match, ball: { ...match.ball, z: 900 } };
    const low = { ...match, ball: { ...match.ball, z: 0 } };

    expect(isAboveView(camera, high.ball)).toBe(true);
    expect(isAboveView(camera, low.ball)).toBe(false);
    expect(drawsFor(camera, low)).toHaveLength(0);

    const rects = drawsFor(camera, high);

    expect(rects.length).toBeGreaterThan(0);
    expect(Math.min(...rects.map(([, y]) => y))).toBeGreaterThanOrEqual(0);
    expect(Math.max(...rects.map(([, y]) => y))).toBeLessThan(24);
  });

  // the marker sat on the top edge, drawn before the HUD, so the score bug or the minimap hid it
  it('drops below any HUD box it would stand behind', () => {
    const match = fixtureMatch({ format: '11' });
    const camera = cameraOver(match);
    const boxes = hudBoxes(match);

    for (const box of boxes) {
      const rects = drawsFor(camera, highBallUnder(camera, match, box.x + box.width / 2));

      expect(rects.length).toBeGreaterThan(10);
      expect(rects.filter((rect) => boxes.some((each) => overlaps(rect, each)))).toEqual([]);
    }
  });
});
