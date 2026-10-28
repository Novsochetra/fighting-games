import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { createPainter } from '../../../src/render/painter.js';
import {
  drawPaintedBackdrop,
  drawPaintedFronts,
  loadPaintedBackdrop,
} from '../../../src/render/scene/painted-backdrop.js';
import { FakeImage } from '../../support/fake-image.js';
import { createLateImages } from '../../support/late-images.js';
import { RecordingCanvas, createRecordingContext } from '../../support/recording-canvas.js';

const createCanvas = (width, height) => Object.assign(new RecordingCanvas(), { width, height });
const loaders = { createImage: () => new FakeImage(), createCanvas, baseUrl: '' };

function strip(width, parallax, ready = true) {
  return { image: { width, recordingId: () => `img(${width})` }, parallax, ready };
}

function record(layers, cameraX, draw = drawPaintedBackdrop) {
  const { context, log } = createRecordingContext(null);
  const shaken = [];
  const setLayer = (offsetX, shake) => shaken.push([offsetX, shake]);
  draw(createPainter(context), setLayer, { backdrop: { layers, fronts: layers }, cameraX });
  const draws = log
    .filter((call) => call.startsWith('drawImage('))
    .map((call) => call.slice('drawImage('.length, -1).split(','));
  return { draws, shaken, log };
}

const recordFronts = (fronts, cameraX) => record(fronts, cameraX, drawPaintedFronts);

describe('painted backdrops', () => {
  it('load one image per layer from the forest folder, each the height of the view', () => {
    const backdrop = loadPaintedBackdrop(loaders, PAINTED_BACKDROPS.pineRidge);
    expect(backdrop.layers.map((layer) => [layer.image.name, layer.parallax])).toEqual([
      ['back.png', 0.08],
      ['near.png', 0.45],
    ]);
    for (const layer of backdrop.layers) {
      expect(layer.ready).toBe(true);
      expect(layer.image.height).toBe(216);
    }
    expect(backdrop.ambient).toBe(PAINTED_BACKDROPS.pineRidge.ambient);
  });

  it('load a cliff face and its mirror image for a road that has one', () => {
    const backdrop = loadPaintedBackdrop(loaders, PAINTED_BACKDROPS.pineRidge);
    const { image, mirrored, ready } = backdrop.cliff;
    expect(ready).toBe(true);
    expect(image.name).toBe('cliff.png');
    expect([mirrored.width, mirrored.height]).toEqual([image.width, image.height]);
    expect(mirrored.recording.log).toEqual([
      `setTransform(-1,0,0,1,${image.width},0)`,
      'drawImage(img(cliff.png),0,0)',
    ]);
  });

  it('settle every layer once its image loads, or fails to, and draw only the loaded ones', () => {
    const pieces = ({ layers, fronts, ground, cliff }) => [...layers, ...fronts, ground, cliff];
    const loaded = createLateImages();
    const failed = createLateImages();
    const forest = loadPaintedBackdrop({ ...loaders, ...loaded }, PAINTED_BACKDROPS.pineRidge);
    const missing = loadPaintedBackdrop({ ...loaders, ...failed }, PAINTED_BACKDROPS.pineRidge);
    expect(pieces(forest).map((piece) => piece.settled)).toEqual([false, false, false, false]);
    loaded.loadAll();
    failed.failAll();
    expect(pieces(forest).every((piece) => piece.ready && piece.settled)).toBe(true);
    expect(pieces(missing).every((piece) => !piece.ready && piece.settled)).toBe(true);
    expect(missing.cliff.mirrored).toBeNull();
  });

  it('load no cliff for a road that keeps the earth line on its steps', () => {
    const plain = { ...PAINTED_BACKDROPS.pineRidge, cliff: false };
    expect(loadPaintedBackdrop(loaders, plain).cliff).toBeNull();
  });

  it('load the level body under a raised road, and the ends of its courses where it is built', () => {
    const temple = loadPaintedBackdrop(loaders, PAINTED_BACKDROPS.angkorWat).deep;
    const ruin = loadPaintedBackdrop(loaders, PAINTED_BACKDROPS.bayon).deep;

    expect([temple.image.name, temple.image.height, temple.from]).toEqual(['deep.png', 216, 20]);
    expect([temple.face.image.name, temple.breach.image.name]).toEqual(['face.png', 'breach.png']);
    expect(temple.breach.mirrored.width).toBe(temple.breach.image.width);
    expect([ruin.image.name, ruin.image.height, ruin.from]).toEqual(['deep.png', 216, 48]);
    expect([ruin.face, ruin.breach]).toEqual([null, null]);
    expect(loadPaintedBackdrop(loaders, PAINTED_BACKDROPS.pineRidge).deep).toBeNull();
  });

  it('tile each layer across the view from its own share of the camera', () => {
    const { draws } = record([strip(320, 0.08), strip(384, 0.45)], 1000);
    expect(draws).toEqual([
      ['img(320)', '-80', '0'],
      ['img(320)', '240', '0'],
      ['img(384)', '-66', '0'],
      ['img(384)', '318', '0'],
    ]);
  });

  it('keep tiling when the camera is left of the road start', () => {
    const { draws } = record([strip(320, 0.5)], -100);
    expect(draws.map(([, x]) => Number(x))).toEqual([-270, 50, 370]);
  });

  it('shake the nearer layers but not the far plate', () => {
    const { shaken } = record([strip(320, 0.08), strip(384, 0.45)], 0);
    expect(shaken).toEqual([
      [0, false],
      [0, true],
    ]);
  });

  it('hold a layer that drifts no faster than the far plate as still as the plate', () => {
    const moon = { ...strip(384, 0.01), once: true };
    const { shaken } = record([strip(320, 0.08), moon, strip(384, 0.45)], 0);
    expect(shaken.map(([, shake]) => shake)).toEqual([false, false, true]);
  });

  it('draw a one-off layer once from the start of the road, scrolling away with its share', () => {
    const entry = { ...strip(300, 0.5), once: true };
    expect(record([entry], 0).draws).toEqual([['img(300)', '0', '0']]);
    expect(record([entry], 400).draws).toEqual([['img(300)', '-200', '0']]);
    expect(record([entry], 600).draws).toEqual([]);
  });

  it('skip a layer until its image has loaded', () => {
    const { draws } = record([strip(320, 0.08, false), strip(0, 0.45)], 500);
    expect(draws).toEqual([]);
  });
});

describe('painted front layers', () => {
  const canopied = { ...PAINTED_BACKDROPS.pineRidge, fronts: [{ name: 'back', parallax: 1.2 }] };

  it('load from the forest folder like the other layers, and are optional', () => {
    const backdrop = loadPaintedBackdrop(loaders, canopied);
    expect(backdrop.fronts.map((layer) => [layer.image.name, layer.parallax])).toEqual([
      ['back.png', 1.2],
    ]);
    expect(backdrop.fronts[0].ready).toBe(true);
    expect(loadPaintedBackdrop(loaders, PAINTED_BACKDROPS.pineRidge).fronts).toEqual([]);
  });

  it('tile across the view, scrolling faster than the camera', () => {
    const { draws } = recordFronts([strip(320, 1.2)], 1000);
    expect(draws).toEqual([
      ['img(320)', '-240', '0'],
      ['img(320)', '80', '0'],
    ]);
    expect(recordFronts([strip(320, 1.2)], -100).draws.map(([, x]) => Number(x))).toEqual([
      -200, 120,
    ]);
  });

  it('draw on the shaking layer, set once for all of them', () => {
    const { shaken } = recordFronts([strip(320, 1.2), strip(400, 1.5)], 0);
    expect(shaken).toEqual([[0, true]]);
  });

  it('draw nothing at all for a backdrop without them', () => {
    for (const backdrop of [{ layers: [] }, { layers: [], fronts: [] }, {}]) {
      const { context, log } = createRecordingContext(null);
      const shaken = [];
      const setLayer = (...args) => shaken.push(args);
      drawPaintedFronts(createPainter(context), setLayer, { backdrop, cameraX: 300 });
      expect(log).toEqual([]);
      expect(shaken).toEqual([]);
    }
  });

  it('skip a front layer until its image has loaded', () => {
    expect(recordFronts([strip(320, 1.2, false), strip(0, 1.2)], 500).draws).toEqual([]);
  });
});
