import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_HEIGHT } from '../../../src/config.js';
import { createPainter } from '../../../src/render/painter.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';
import { drawTerrainGround, surfaceRuns } from '../../../src/render/scene/terrain-ground.js';
import { createRecordingContext } from '../../support/recording-canvas.js';
import { drawnRects } from './ambient/ambient-recorder.js';

const colors = scenePalette('oldGrove').ground;
const flat = () => GROUND_Y;
// a ramp up from x=100 to a 20px bank at x=160..260, with a sheer drop at 260
const hilly = (x) => {
  if (x >= 100 && x < 160) {
    return GROUND_Y - Math.round((x - 100) / 3);
  }
  return x >= 160 && x < 260 ? GROUND_Y - 20 : GROUND_Y;
};

function record(surfaceAt, { cameraX = 0, tick = 0 } = {}) {
  const { context, log } = createRecordingContext(null);
  drawTerrainGround(createPainter(context), { cameraX, colors, tick, surfaceAt });
  return drawnRects(log);
}

describe('surface runs', () => {
  it('draw a level road as one run', () => {
    expect(surfaceRuns(flat, 40, 424)).toEqual([{ x: 40, width: 384, y: GROUND_Y }]);
  });

  it('split where the height changes', () => {
    const runs = surfaceRuns(hilly, 150, 270);
    expect(runs[0]).toEqual({ x: 150, width: 3, y: GROUND_Y - 17 });
    expect(runs.at(-2)).toEqual({ x: 159, width: 101, y: GROUND_Y - 20 });
    expect(runs.at(-1)).toEqual({ x: 260, width: 10, y: GROUND_Y });
  });
});

describe('the road over hills', () => {
  it('lays the soil from the local surface down to the bottom of the view', () => {
    const rects = record(hilly);
    const soilTops = rects.filter((rect) => rect.color === colors.sand).map((rect) => rect.y);
    expect(Math.min(...soilTops)).toBe(GROUND_Y - 20);
    for (const rect of rects) {
      expect(rect.y + rect.height).toBeLessThanOrEqual(VIEW_HEIGHT);
    }
  });

  it('shows an earth face on the high side of a sheer step', () => {
    const faces = record(hilly).filter((rect) => rect.color === colors.rut && rect.width === 2);
    expect(faces).toEqual([
      { x: 258, y: GROUND_Y - 18, width: 2, height: 20, color: colors.rut, alpha: 1 },
    ]);
  });

  it('keeps stones and grass on the surface where they lie', () => {
    const rects = record(hilly);
    for (const rect of rects) {
      expect(rect.y, `${rect.color} at ${rect.x}`).toBeGreaterThanOrEqual(hilly(rect.x) - 6);
    }
  });

  it('only lets the grass move with time', () => {
    const still = (tick) =>
      record(hilly, { tick }).filter(
        (rect) => rect.color !== colors.grassLight && rect.color !== colors.grass,
      );
    expect(still(0)).toEqual(still(200));
    expect(record(hilly, { tick: 0 })).not.toEqual(record(hilly, { tick: 70 }));
  });
});

describe('the painted road', () => {
  const texture = {
    image: { width: 128, height: 64, recordingId: () => 'img(ground.png)' },
    ready: true,
    top: 7,
  };

  function textureDraws(surfaceAt, cameraX = 0) {
    const { context, log } = createRecordingContext(null);
    drawTerrainGround(createPainter(context), { cameraX, colors, tick: 0, surfaceAt, texture });
    return log
      .filter((call) => call.startsWith('drawImage('))
      .map((call) => call.slice(10, -1).split(',').slice(1).map(Number));
  }

  it('lays the cross-section with its surface row on the road, tile after tile', () => {
    const draws = textureDraws(flat, 100);
    expect(draws[0]).toEqual([100, 0, 28, 64, 100, GROUND_Y - 7, 28, 64]);
    expect(draws[1]).toEqual([0, 0, 128, 64, 128, GROUND_Y - 7, 128, 64]);
  });

  it('runs the last row on down to the bottom of the view under a high bank', () => {
    const bank = () => GROUND_Y - 30;
    const [cross, deep] = textureDraws(bank, 0);
    const bottom = GROUND_Y - 30 - 7 + 64;
    expect(cross).toEqual([0, 0, 128, 64, 0, GROUND_Y - 37, 128, 64]);
    expect(deep).toEqual([0, 63, 128, 1, 0, bottom, 128, 216 - bottom]);
  });

  it('rides up a hill column by column', () => {
    const tops = textureDraws(hilly)
      .filter((draw) => draw[3] === 64)
      .map((draw) => draw[5] + 7);
    expect(Math.min(...tops)).toBe(GROUND_Y - 20);
  });

  it('falls back to drawn soil until the picture has loaded', () => {
    const { context, log } = createRecordingContext(null);
    const loading = { ...texture, ready: false };
    drawTerrainGround(createPainter(context), {
      cameraX: 0,
      colors,
      tick: 0,
      surfaceAt: flat,
      texture: loading,
    });
    expect(log.some((call) => call.startsWith('drawImage('))).toBe(false);
    expect(log).toContain(`fillStyle=${colors.sand}`);
  });
});
