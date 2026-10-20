import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_HEIGHT } from '../../../src/config.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawForeground } from '../../../src/render/scene/foreground.js';
import { drawGround } from '../../../src/render/scene/ground.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';
import { drawnRects } from './ambient/ambient-recorder.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

function record(draw) {
  const { context, log } = createRecordingContext(null);
  draw(createPainter(context));
  return log;
}

const forest = scenePalette('pineRidge');
const desert = scenePalette('storm');
const colorsIn = (log) => new Set(drawnRects(log).map((rect) => rect.color));

describe('the forest road', () => {
  it('lays soil that darkens with depth under grass, stones and roots', () => {
    const log = record((painter) => drawGround(painter, 400, forest.ground, 0));
    const colors = colorsIn(log);
    for (const key of ['sand', 'soil', 'soilDeep', 'grass', 'grassLight', 'grassDark', 'pebble']) {
      expect(colors.has(forest.ground[key]), key).toBe(true);
    }
  });

  it('keeps the soil still and only lets the grass tips move in the wind', () => {
    const still = (tick) =>
      drawnRects(record((painter) => drawGround(painter, 400, forest.ground, tick))).filter(
        (rect) => rect.y >= GROUND_Y,
      );
    expect(still(0)).toEqual(still(200));
    const tips = (tick) =>
      record((painter) => drawGround(painter, 400, forest.ground, tick)).join('|');
    expect(tips(0)).not.toBe(tips(70));
  });

  it('stays between the tallest grass blade and the bottom of the view', () => {
    const rects = drawnRects(record((painter) => drawGround(painter, 1234, forest.ground, 33)));
    for (const rect of rects) {
      expect(rect.y).toBeGreaterThanOrEqual(GROUND_Y - 6);
      expect(rect.y + rect.height).toBeLessThanOrEqual(VIEW_HEIGHT);
    }
  });

  it('leaves the desert road with sand and ruts and no grass', () => {
    const colors = colorsIn(record((painter) => drawGround(painter, 400, desert.ground, 0)));
    expect(colors.has(desert.ground.sand)).toBe(true);
    expect(desert.ground.grass).toBeUndefined();
  });
});

describe('what lies in front of the fighters', () => {
  it('is fern clumps that nod in the forests', () => {
    const at = (tick) => record((painter) => drawForeground(painter, 900, forest.rubble, tick));
    const colors = colorsIn(at(0));
    expect(colors.has(forest.rubble.fern)).toBe(true);
    expect(colors.has(forest.rubble.rock)).toBe(false);
    expect(at(0).join('|')).not.toBe(at(80).join('|'));
  });

  it('is still rubble on the desert roads', () => {
    const colors = colorsIn(record((painter) => drawForeground(painter, 900, desert.rubble, 0)));
    expect(colors.has(desert.rubble.rock)).toBe(true);
  });
});
