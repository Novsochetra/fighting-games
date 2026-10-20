import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { PLATFORM_SPRITES } from '../../../src/data/platform-sprites.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawPlatforms, loadPlatformSprites } from '../../../src/render/scene/platforms.js';
import { FakeImage } from '../../support/fake-image.js';
import { readPngAlpha } from '../../support/png-alpha.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const sheets = loadPlatformSprites({ createImage: () => new FakeImage(), baseUrl: '' });
const DIRECTORY = new URL('../../../assets/sprites/platforms/', import.meta.url);

// the stretches of one row of a sprite that are not see-through, as [first, last] columns
function opaqueRuns(png, y, from, to) {
  const runs = [];
  for (let x = from; x < to; x++) {
    if (png.alpha(x, y) && (x === from || !png.alpha(x - 1, y))) {
      runs.push([x, x]);
    }
    if (png.alpha(x, y)) {
      runs.at(-1)[1] = x;
    }
  }
  return runs;
}

function terrainWith(platforms, heightAt = () => GROUND_Y) {
  const heights = Int16Array.from({ length: 2000 }, (_, x) => heightAt(x));
  return { heights, platforms };
}

function draws(terrain, cameraX = 0, loaded = sheets) {
  const { context, log } = createRecordingContext(null);
  drawPlatforms(createPainter(context), { cameraX, terrain, sheets: loaded });
  return log
    .filter((call) => call.startsWith('drawImage('))
    .map((call) => call.slice(10, -1).split(','));
}

describe('platforms', () => {
  it('load one sprite per kind, as wide as the platform it makes', () => {
    for (const [kind, sprite] of Object.entries(PLATFORM_SPRITES)) {
      expect(sheets.ready[kind], kind).toBe(true);
      expect(sheets.images[kind].width / 2, kind).toBe(sprite.width);
    }
  });

  it('end in a clean cross-section of one leg in each half, under the leg it names', () => {
    for (const [kind, sprite] of Object.entries(PLATFORM_SPRITES)) {
      const png = readPngAlpha(fileURLToPath(new URL(sprite.file, DIRECTORY)));
      const half = png.width / 2;
      sprite.legs.forEach((legX, side) => {
        const runs = opaqueRuns(png, png.height - 1, side * half, (side + 1) * half);
        expect(runs, `${kind} leg ${side}`).toHaveLength(1);
        expect(legX * 2, `${kind} leg ${side}`).toBeGreaterThanOrEqual(runs[0][0]);
        expect(legX * 2, `${kind} leg ${side}`).toBeLessThanOrEqual(runs[0][1]);
      });
    }
  });

  it('stand fighters on a row that runs nearly the whole width of the deck', () => {
    for (const [kind, sprite] of Object.entries(PLATFORM_SPRITES)) {
      const png = readPngAlpha(fileURLToPath(new URL(sprite.file, DIRECTORY)));
      const covered = opaqueRuns(png, sprite.topY, 0, png.width).reduce(
        (sum, [first, last]) => sum + last - first + 1,
        0,
      );
      expect(covered / png.width, kind).toBeGreaterThanOrEqual(0.9);
    }
  });

  it('grow a deck its legs down to the ground under each leg, slope or not', () => {
    const slope = (x) => (x < 400 ? GROUND_Y : GROUND_Y - 10);
    const terrain = terrainWith([{ x: 350, y: 130, width: 80, kind: 'planks' }], slope);
    const [left, right, deck] = draws(terrain);
    const legTop = 130 + (40 - 7) / 2;
    expect(left).toEqual([
      'img(planks.png)',
      '0',
      '39',
      '80',
      '1',
      '350',
      String(legTop),
      '40',
      String(GROUND_Y - legTop),
    ]);
    expect(right).toEqual([
      'img(planks.png)',
      '80',
      '39',
      '80',
      '1',
      '390',
      String(legTop),
      '40',
      String(GROUND_Y - 10 - legTop),
    ]);
    expect(deck).toEqual(['img(planks.png)', '350', String(Math.round(130 - 7 / 2)), '80', '20']);
  });

  it('set a temple ledge on its own top row and pillars', () => {
    const { topY } = PLATFORM_SPRITES.ledge;
    const terrain = terrainWith([{ x: 350, y: 130, width: 80, kind: 'ledge' }]);
    const [left, right, ledge] = draws(terrain);
    const legTop = 130 + (40 - topY) / 2;
    expect(left).toEqual([
      'img(ledge.png)',
      '0',
      '39',
      '80',
      '1',
      '350',
      String(legTop),
      '40',
      String(GROUND_Y - legTop),
    ]);
    expect(right.slice(1, 7)).toEqual(['80', '39', '80', '1', '390', String(legTop)]);
    expect(ledge).toEqual([
      'img(ledge.png)',
      '350',
      String(Math.round(130 - topY / 2)),
      '80',
      '20',
    ]);
  });

  it('skip platforms off screen and sprites not loaded yet', () => {
    const terrain = terrainWith([{ x: 900, y: 140, width: 80, kind: 'planks' }]);
    expect(draws(terrain, 0)).toEqual([]);
    expect(draws(terrain, 600, { images: sheets.images, ready: {} })).toEqual([]);
    expect(draws(terrain, 600)).toHaveLength(3);
  });
});
