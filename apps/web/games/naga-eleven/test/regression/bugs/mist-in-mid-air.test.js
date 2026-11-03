import { describe, expect, it, vi } from 'vitest';
import { VIEW } from '../../../src/config.js';
import { drawMist } from '../../../src/render/backdrops/parts/mist.js';
import { ART_HEIGHT, ART_SCALE, ART_WIDTH } from '../../../src/render/backdrops/raster.js';
import { VILLAGE_DAWN } from '../../../src/render/backdrops/scenes/village-dawn.js';
import { VILLAGE_DUSK } from '../../../src/render/backdrops/scenes/village-dusk.js';
import { villageMistMask } from '../../../src/render/backdrops/scenes/village-mist.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';

// The chapter card's mist was drawn as hard-edged bars over the whole picture, so it crossed the
// stilt house, the grove and the palms in mid-air. It lies on the fields: whatever stands up out of
// them, nearer than the mist, stands in front of it.

vi.mock('../../../src/render/backdrops/parts/mist.js', async (importOriginal) => {
  const real = await importOriginal();

  return { ...real, drawMist: vi.fn(real.drawMist) };
});

const TICKS = [0, 400, 1300, 2900, 5200];
const SCENES = { 'village-dawn': VILLAGE_DAWN, 'village-dusk': VILLAGE_DUSK };

// the mist a scene draws at a tick, alone on a clear canvas
function mistAlone(scene, tick) {
  drawMist.mockClear();
  scene.overlay(createPixelCanvas(VIEW.width, VIEW.height).getContext('2d'), tick);

  const canvas = createPixelCanvas(VIEW.width, VIEW.height);

  drawMist(canvas.getContext('2d'), drawMist.mock.calls[0][1]);

  return canvas.data;
}

const misted = (data, x, y) => data[(y * ART_SCALE * VIEW.width + x * ART_SCALE) * 4 + 3] > 0;

function artPixels(test) {
  const found = [];

  for (let y = 0; y < ART_HEIGHT; y += 1) {
    for (let x = 0; x < ART_WIDTH; x += 1) {
      if (test(x, y)) {
        found.push([x, y]);
      }
    }
  }

  return found;
}

describe('the village mist', () => {
  it('passes behind the house, the trees, the palms and the fence, dawn and dusk alike', () => {
    const standing = villageMistMask();

    for (const [name, scene] of Object.entries(SCENES)) {
      for (const tick of TICKS) {
        const mist = mistAlone(scene, tick);

        expect(
          artPixels((x, y) => standing(x, y) && misted(mist, x, y)),
          `${name} at ${tick}`,
        ).toEqual([]);
      }
    }
  });

  it('still lies over the open fields, low by the horizon', () => {
    for (const scene of Object.values(SCENES)) {
      for (const tick of TICKS) {
        const mist = mistAlone(scene, tick);
        const rows = artPixels((x, y) => misted(mist, x, y)).map(([, y]) => y);

        expect(rows.length).toBeGreaterThan(200);
        expect(Math.min(...rows)).toBeGreaterThan(90);
        expect(Math.max(...rows)).toBeLessThan(140);
      }
    }
  });
});
