import { describe, expect, it } from 'vitest';
import { BALL_ART } from '../../../src/art/actors.js';
import { UI_SCALE, VIEW, WORLD_VIEW } from '../../../src/config.js';
import { BALL } from '../../../src/data/tuning.js';
import { createActorArt } from '../../../src/render/actors/index.js';
import { createCamera, project, updateCamera } from '../../../src/render/camera.js';
import { scaleAt } from '../../../src/render/camera/lens.js';
import { drawFrame } from '../../../src/render/draw-frame.js';
import { drawHud } from '../../../src/render/hud/index.js';
import { drawMinimap } from '../../../src/render/minimap.js';
import { useUiSpace } from '../../../src/render/spaces.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';

// "we player can't see the whole map of player": at 1.45 canvas pixels a world unit, a 768 pixel
// view showed about 530 units of an 11 v 11 pitch across, and a handful of players. The match
// world is now drawn on a canvas twice the view each way, the footballers at their own size, while
// everything laid out in the view (the HUD, cards, menus) is drawn twice as big over it.
const OLD_VIEW_WIDTH = 768;

function settledCamera(match) {
  const camera = createCamera(match);

  for (let i = 0; i < 120; i += 1) {
    updateCamera(camera, match);
  }

  return camera;
}

// every second pixel of a canvas drawn twice as big, back at the view's size
function halved(canvas) {
  const out = createPixelCanvas(VIEW.width, VIEW.height);

  for (let y = 0; y < VIEW.height; y += 1) {
    for (let x = 0; x < VIEW.width; x += 1) {
      const from = (y * UI_SCALE * canvas.width + x * UI_SCALE) * 4;

      out.data.set(canvas.data.subarray(from, from + 4), (y * VIEW.width + x) * 4);
    }
  }

  return out;
}

const sameShare = (first, second) => {
  let same = 0;

  for (let at = 0; at < first.data.length; at += 4) {
    same += [0, 1, 2, 3].every((i) => first.data[at + i] === second.data[at + i]) ? 1 : 0;
  }

  return same / (first.data.length / 4);
};

describe('the match view', () => {
  it.each(['7', '11'])('shows twice the pitch across of the old view, %s a side', (format) => {
    const match = createMatch({ seed: 2, format });
    const camera = settledCamera(match);
    const across = WORLD_VIEW.width / scaleAt(camera.lens, camera.depth.value);

    expect(across).toBeGreaterThanOrEqual(
      (2 * OLD_VIEW_WIDTH) / scaleAt(camera.lens, camera.depth.value),
    );
    expect(across).toBeGreaterThan(1000);
  });

  it('draws the world at the canvas’s own pixels under the UI’s scale, and hands the scale back', () => {
    const match = createMatch({ seed: 2, format: '11' });
    const camera = settledCamera(match);
    const canvas = createPixelCanvas(WORLD_VIEW.width, WORLD_VIEW.height);
    const context = canvas.getContext('2d');
    const spot = project(camera, match.ball.x, match.ball.y, BALL.radius);
    const whites = new Set(BALL_ART.white);
    let ballPixels = 0;

    useUiSpace(context);
    drawFrame(context, match, camera, {
      actors: createActorArt({ createCanvas: createPixelCanvas }),
      createCanvas: createPixelCanvas,
    });

    for (let y = Math.round(spot.y) - 4; y <= Math.round(spot.y) + 4; y += 1) {
      for (let x = Math.round(spot.x) - 4; x <= Math.round(spot.x) + 4; x += 1) {
        const at = (y * canvas.width + x) * 4;
        const hex = `#${[0, 1, 2].map((i) => canvas.data[at + i].toString(16).padStart(2, '0')).join('')}`;

        ballPixels += whites.has(hex) ? 1 : 0;
      }
    }

    expect(spot.x).toBeGreaterThan(VIEW.width);
    expect(ballPixels).toBeGreaterThan(4);
    expect(context.scaleX).toBe(UI_SCALE);
  });

  it('lays the HUD out as it was, drawn twice as big', () => {
    const match = createMatch({ seed: 2, format: '11', humanTeam: 0 });
    const once = createPixelCanvas(VIEW.width, VIEW.height);
    const twice = createPixelCanvas(WORLD_VIEW.width, WORLD_VIEW.height);
    const options = { tick: 30, minimap: drawMinimap };

    drawHud(once.getContext('2d'), match, options);
    useUiSpace(twice.getContext('2d'));
    drawHud(twice.getContext('2d'), match, options);

    expect(sameShare(halved(twice), once)).toBeGreaterThan(0.995);
  });
});
