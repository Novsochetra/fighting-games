import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { FX_SCALE, FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { loadFxSheets } from '../../../src/render/fx/fx-sheets.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawQuicksand } from '../../../src/render/scene/quicksand.js';
import { FakeImage } from '../../support/fake-image.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const sheets = loadFxSheets({
  createImage: () => new FakeImage(),
  createCanvas: () => null,
  baseUrl: '',
});
// the patch art is drawn at the road's own density
const SIZE = 2 * FX_SCALE;

function drawnAt(patch) {
  const { context, log } = createRecordingContext(null);

  drawQuicksand(createPainter(context), sheets, { quicksand: [patch], cameraX: 0, tick: 0 });

  return log
    .filter((call) => call.startsWith('translate('))
    .map((call) => call.slice(10, -1).split(',').map(Number));
}

describe('a patch of quicksand on the road', () => {
  it('is drawn down in the road, its far rim on the top edge the fighters stand on', () => {
    const [[x, y]] = drawnAt({ x: 200, y: GROUND_Y });
    const top = y - FX_SPRITES.quicksand.anchorY * SIZE;

    expect(x).toBe(200);
    expect(y).toBeGreaterThan(GROUND_Y);
    expect(Math.abs(top - GROUND_Y)).toBeLessThanOrEqual(1);
  });
});
