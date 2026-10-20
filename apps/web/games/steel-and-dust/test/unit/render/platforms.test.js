import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { PLATFORM_SPRITES } from '../../../src/data/platform-sprites.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawPlatforms, loadPlatformSprites } from '../../../src/render/scene/platforms.js';
import { FakeImage } from '../../support/fake-image.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const sheets = loadPlatformSprites({ createImage: () => new FakeImage(), baseUrl: '' });

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

  it('lay a log on the road with its top where fighters stand', () => {
    const top = GROUND_Y - PLATFORM_SPRITES.log.rise;
    const [log] = draws(terrainWith([{ x: 300, y: top, width: 80, kind: 'log' }]));
    expect(log).toEqual(['img(log.png)', '300', String(top - 3), '80', '20']);
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

  it('skip platforms off screen and sprites not loaded yet', () => {
    const terrain = terrainWith([{ x: 900, y: 140, width: 80, kind: 'planks' }]);
    expect(draws(terrain, 0)).toEqual([]);
    expect(draws(terrain, 600, { images: sheets.images, ready: {} })).toEqual([]);
    expect(draws(terrain, 600)).toHaveLength(3);
  });
});
