import { describe, expect, it } from 'vitest';
import { WORLD_VIEW } from '../../../../src/config.js';
import { FORMATS } from '../../../../src/data/formats.js';
import { createCamera, project, updateCamera, viewOf } from '../../../../src/render/camera.js';
import { packed } from '../../../../src/render/venues/kit/colour.js';
import { columnOf, groundFrame, worldXOf } from '../../../../src/render/venues/layers/frame.js';
import { bakeGround, drawGround } from '../../../../src/render/venues/layers/ground.js';
import { paintGroundRow } from '../../../../src/render/venues/ground/paint.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

const LINE_X = 700;
const GRASS = packed('#204020');
const WHITE = packed('#ffffff');

// a ground of plain grass with one line across it at LINE_X, baked and laid down as the game does
function drawnGround(camera) {
  const frame = groundFrame(camera.lens, camera.bounds, { far: -60, near: 1180 });
  const markings = {
    along: [],
    across: [{ x: LINE_X, from: -60, to: 1180 }],
    rings: [],
    spots: [],
  };
  const lines = { markings, thick: { along: 2, across: 2, spot: 2 }, colour: () => WHITE };
  const raster = bakeGround(camera.lens, frame, (pixels, row) =>
    paintGroundRow(pixels, row, { frame, surface: () => GRASS, lines }),
  );
  const image = createPixelCanvas(frame.width, frame.height);
  const canvas = createPixelCanvas(WORLD_VIEW.width, WORLD_VIEW.height);

  image
    .getContext('2d')
    .putImageData({ width: frame.width, height: frame.height, data: raster.data }, 0, 0);
  drawGround(canvas.getContext('2d'), { canvas: image, frame }, viewOf(camera));

  return canvas;
}

const whiteAt = (canvas, row) =>
  Array.from({ length: canvas.width }, (_, x) => x).filter(
    (x) => canvas.data[(row * canvas.width + x) * 4 + 1] === 255,
  );

describe('the ground drawn once and laid down each frame', () => {
  it('turns a column of the picture back into the world x it was drawn from', () => {
    const match = {
      pitch: FORMATS[11].pitch,
      goal: FORMATS[11].goal,
      phase: 'play',
      score: [0, 0],
    };
    const frame = groundFrame(createCamera(match).lens, createCamera(match).bounds, {
      far: -60,
      near: 1180,
    });

    expect(worldXOf(frame, columnOf(frame, 812.4, 1.2), 1.2)).toBeCloseTo(812.4, 0);
  });

  it('leans each row by its own depth, so a line lands where the camera projects it', () => {
    const match = {
      pitch: FORMATS[11].pitch,
      goal: FORMATS[11].goal,
      phase: 'play',
      score: [0, 0],
      tick: 0,
      players: [],
      events: [],
      ball: { x: 400, y: 500, vx: 0, vy: 0, owner: null },
    };
    const camera = createCamera(match);

    for (let i = 0; i < 200; i += 1) {
      match.tick += 1;
      updateCamera(camera, match);
    }

    const canvas = drawnGround(camera);

    for (const y of [200, 400, 600]) {
      const point = project(camera, LINE_X, y);
      const found = whiteAt(canvas, Math.round(point.y));

      expect(Math.min(...found.map((x) => Math.abs(x - point.x)))).toBeLessThanOrEqual(2);
    }
  });
});
