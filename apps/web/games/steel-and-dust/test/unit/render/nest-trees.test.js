import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawNestTrees, nestTreeAt } from '../../../src/render/scene/nest-trees.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const TREE = { layer: 'near', from: 280, to: 380, base: 180, bough: 350 };
const near = { name: 'near', ready: true, image: { recordingId: () => 'img(near)' } };
const forest = { layers: [{ name: 'back', ready: true }, near], nestTree: TREE };

function draws(nests, { backdrop = forest, cameraX = 0 } = {}) {
  const { context, log } = createRecordingContext(null);

  drawNestTrees(createPainter(context), { nests, backdrop, cameraX });

  return log
    .filter((call) => call.startsWith('drawImage('))
    .map((call) => call.slice(10, -1).split(','));
}

describe('the tree a hornet nest hangs from', () => {
  it('is the slice of the forest layer that holds the tree, the full height of the tree', () => {
    const [call] = draws([{ x: 200, y: GROUND_Y }]);
    const { left, top } = nestTreeAt({ x: 200, y: GROUND_Y }, TREE);

    expect(call).toEqual([
      'img(near)',
      '280',
      '0',
      '100',
      '180',
      `${left}`,
      `${top}`,
      '100',
      '180',
    ]);
  });

  it('stands left of its nest, with its bough under the thick end of the nest’s branch', () => {
    const place = nestTreeAt({ x: 200, y: GROUND_Y }, TREE);

    expect(place.left + (TREE.bough - TREE.from)).toBe(200 - 16);
    expect(place.left + place.width).toBeGreaterThan(200);
  });

  it('has its foot a little down in the road under the nest', () => {
    const { top } = nestTreeAt({ x: 200, y: GROUND_Y }, TREE);

    expect(top + TREE.base).toBeGreaterThan(GROUND_Y);
    expect(top + TREE.base).toBeLessThan(GROUND_Y + 6);
  });

  it('is drawn only while some of it is in view', () => {
    const nests = [{ x: 200, y: GROUND_Y }];
    const { left, width } = nestTreeAt(nests[0], TREE);

    expect(draws(nests, { cameraX: left + width })).toEqual([]);
    expect(draws(nests, { cameraX: left - VIEW_WIDTH })).toEqual([]);
    expect(draws(nests, { cameraX: left + width - 1 })).toHaveLength(1);
    expect(draws(nests, { cameraX: left - VIEW_WIDTH + 1 })).toHaveLength(1);
  });

  it('is left out in a forest with no nest tree, and until its layer has loaded', () => {
    const nests = [{ x: 200, y: GROUND_Y }];
    const loading = { ...forest, layers: [{ ...near, ready: false }] };

    expect(draws(nests, { backdrop: { layers: [near] } })).toEqual([]);
    expect(draws(nests, { backdrop: loading })).toEqual([]);
    expect(draws(nests, { backdrop: null })).toEqual([]);
  });
});
