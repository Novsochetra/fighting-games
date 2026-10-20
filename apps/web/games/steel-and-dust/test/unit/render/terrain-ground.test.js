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
