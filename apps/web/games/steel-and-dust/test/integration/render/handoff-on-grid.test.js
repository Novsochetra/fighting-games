import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { createView } from '../../../src/render/create-view.js';
import { drawTitleCard } from '../../../src/render/hud/title-card.js';
import { drawMissionWipe } from '../../../src/render/overlays/mission-wipe.js';
import { pixelate } from '../../../src/render/overlays/mosaic.js';
import { missionWipe, mosaicBlock } from '../../../src/render/overlays/wipe-timing.js';
import { CLEAR_TICKS, REVEAL_FRAMES } from '../../../src/sim/stage/stage-clear.js';
import { FakeImage } from '../../support/fake-image.js';
import { createGridContext } from '../../support/grid-canvas.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';

function gridView() {
  const { context, misses, counts } = createGridContext();
  context.canvas = { width: 768, height: 432 };
  const view = createView({
    context,
    createCanvas: (width, height) => Object.assign(new RecordingCanvas(), { width, height }),
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  return { view, painter: view.painter, misses, counts };
}

function everyWipe() {
  const closing = Array.from({ length: CLEAR_TICKS }, (_, i) =>
    missionWipe({ clearTime: i + 1, missionIndex: 0, fadeIn: 0 }),
  );
  const opening = Array.from({ length: REVEAL_FRAMES }, (_, i) =>
    missionWipe({ clearTime: 0, missionIndex: 1, fadeIn: i + 1 }),
  );
  return [...closing, ...opening].filter(Boolean);
}

// the hand-off between two missions is pixel art drawn in code: every block of the mosaic, every
// diamond of the wipe and every letter of a title card has to land on whole screen pixels
describe('the hand-off between two missions on the pixel grid', () => {
  it('lays the mosaic and the wipe on whole screen pixels at every step', () => {
    const { view, painter, misses, counts } = gridView();
    for (const wipe of everyWipe()) {
      pixelate(painter, view, mosaicBlock(wipe));
      drawMissionWipe(painter, view, wipe);
    }
    expect(misses).toEqual([]);
    expect(counts.draws).toBeGreaterThan(1000);
  });

  it('stamps every letter of the title cards on whole screen pixels as they fall', () => {
    const { painter, misses, counts } = gridView();
    const banners = [
      { text: 'Mission complete', stamp: true },
      { text: 'Mission 10', sub: "Warden's Fortress", stamp: true },
    ];
    for (const banner of banners) {
      for (let age = -20; age < 140; age++) {
        drawTitleCard(painter, { banner, age });
      }
    }
    expect(misses).toEqual([]);
    expect(counts.draws).toBeGreaterThan(1000);
  });
});
