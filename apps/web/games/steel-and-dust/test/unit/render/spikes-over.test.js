import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { FX_SCALE, FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { SPIKE_TRAP } from '../../../src/data/spike-traps.js';
import { loadFxSheets } from '../../../src/render/fx/fx-sheets.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawSpikesOver } from '../../../src/render/scene/spike-traps.js';
import { FakeImage } from '../../support/fake-image.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const sheets = loadFxSheets({
  createImage: () => new FakeImage(),
  createCanvas: () => null,
  baseUrl: '',
});
const { frameWidth, anchorY } = FX_SPRITES.spikeTrap;
const UP = SPIKE_TRAP.rest + SPIKE_TRAP.warn + SPIKE_TRAP.rise + 1;
const FRAME_UP = 3;

function drawn(time) {
  const { context, log } = createRecordingContext(null);
  const tile = { x: 200, y: GROUND_Y, time };

  drawSpikesOver(createPainter(context), sheets, { spikeTraps: [tile], cameraX: 0 });

  return log;
}

describe('the spikes over the fighters', () => {
  it('draws nothing while a tile lies flat', () => {
    expect(drawn(10).filter((call) => call.startsWith('drawImage('))).toEqual([]);
  });

  it('draws what stands up out of the slots again, cut off at the road line', () => {
    const log = drawn(UP);
    const [rect] = log.filter((call) => call.startsWith('rect('));
    const [, top, , height] = rect.slice(5, -1).split(',').map(Number);
    const image = log.find((call) => call.startsWith('drawImage(img(spikeTrap.png)'));

    expect(log.indexOf('clip()')).toBeGreaterThan(-1);
    expect(top + height).toBe(GROUND_Y);
    expect(top).toBe(GROUND_Y - anchorY * FX_SCALE);
    expect(image).toContain(`,${FRAME_UP * frameWidth},0,`);
  });
});
