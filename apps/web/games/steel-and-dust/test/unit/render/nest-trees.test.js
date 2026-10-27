import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { NEST } from '../../../src/data/nests.js';
import { loadFxSheets } from '../../../src/render/fx/fx-sheets.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawNestTrees, nestTreeAt } from '../../../src/render/scene/nest-trees.js';
import { FakeImage } from '../../support/fake-image.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const TREE = { layer: 'near', from: 280, to: 380, base: 180, bough: 350, branch: 3 };
const near = { name: 'near', ready: true, image: { recordingId: () => 'img(near)' } };
const forest = { layers: [{ name: 'back', ready: true }, near], nestTree: TREE };
const sheets = loadFxSheets({
  createImage: () => new FakeImage(),
  createCanvas: () => null,
  baseUrl: '',
});
const NEST_AT = { x: 200, y: GROUND_Y };

function record(nests, { backdrop = forest, cameraX = 0 } = {}) {
  const { context, log } = createRecordingContext(null);

  drawNestTrees(createPainter(context), sheets, { nests, backdrop, cameraX });

  return log;
}

function draws(nests, options) {
  return record(nests, options)
    .filter((call) => call.startsWith('drawImage('))
    .map((call) => call.slice(10, -1).split(','));
}

describe('the tree a hornet nest hangs from', () => {
  it('is the slice of the forest layer that holds the tree, the full height of the tree', () => {
    const [call] = draws([NEST_AT]);
    const { left, top } = nestTreeAt(NEST_AT, TREE);

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
    const place = nestTreeAt(NEST_AT, TREE);

    expect(place.left + (TREE.bough - TREE.from)).toBe(NEST_AT.x - 16);
    expect(place.left + place.width).toBeGreaterThan(NEST_AT.x);
  });

  it('has its foot a little down in the road under the nest', () => {
    const { top } = nestTreeAt(NEST_AT, TREE);

    expect(top + TREE.base).toBeGreaterThan(GROUND_Y);
    expect(top + TREE.base).toBeLessThan(GROUND_Y + 6);
  });

  it('carries the branch the nest hangs by, in its own bark, over the tree', () => {
    const log = record([NEST_AT]);
    const [, branch] = draws([NEST_AT]);
    const sourceX = TREE.branch * FX_SPRITES.nestBranch.frameWidth;

    expect(branch.slice(0, 3)).toEqual(['img(nestBranch.png)', `${sourceX}`, '0']);
    expect(log).toContain(`translate(${NEST_AT.x},${NEST_AT.y - NEST.hang})`);
  });

  it('holds a nest by its rope alone when it has no branch, the rope’s top in its boughs', () => {
    const pine = { ...TREE, branch: undefined };
    const calls = draws([NEST_AT], { backdrop: { ...forest, nestTree: pine } });
    const place = nestTreeAt(NEST_AT, pine);

    expect(calls.map(([image]) => image)).toEqual(['img(near)']);
    expect(place.left + (pine.bough - pine.from)).toBe(NEST_AT.x - 4);
  });

  it('is drawn only while some of it is in view', () => {
    const { left, width } = nestTreeAt(NEST_AT, TREE);

    expect(draws([NEST_AT], { cameraX: left + width })).toEqual([]);
    expect(draws([NEST_AT], { cameraX: left - VIEW_WIDTH })).toEqual([]);
    expect(draws([NEST_AT], { cameraX: left + width - 1 })).toHaveLength(2);
    expect(draws([NEST_AT], { cameraX: left - VIEW_WIDTH + 1 })).toHaveLength(2);
  });

  it('is left out in a forest with no nest tree, and until its layer has loaded', () => {
    const loading = { ...forest, layers: [{ ...near, ready: false }] };

    expect(draws([NEST_AT], { backdrop: { layers: [near] } })).toEqual([]);
    expect(draws([NEST_AT], { backdrop: loading })).toEqual([]);
    expect(draws([NEST_AT], { backdrop: null })).toEqual([]);
  });
});
