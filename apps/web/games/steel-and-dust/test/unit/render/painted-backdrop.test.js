import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { createPainter } from '../../../src/render/painter.js';
import {
  drawPaintedBackdrop,
  loadPaintedBackdrop,
} from '../../../src/render/scene/painted-backdrop.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas, createRecordingContext } from '../../support/recording-canvas.js';

const createCanvas = (width, height) => Object.assign(new RecordingCanvas(), { width, height });
const loaders = { createImage: () => new FakeImage(), createCanvas, baseUrl: '' };

function strip(width, parallax, ready = true) {
  return { image: { width, recordingId: () => `img(${width})` }, parallax, ready };
}

function record(layers, cameraX) {
  const { context, log } = createRecordingContext(null);
  const shaken = [];
  const setLayer = (offsetX, shake) => shaken.push([offsetX, shake]);
  drawPaintedBackdrop(createPainter(context), setLayer, { backdrop: { layers }, cameraX });
  const draws = log
    .filter((call) => call.startsWith('drawImage('))
    .map((call) => call.slice('drawImage('.length, -1).split(','));
  return { draws, shaken };
}

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

  it('load no cliff for a road that keeps the earth line on its steps', () => {
    const plain = { ...PAINTED_BACKDROPS.pineRidge, cliff: false };
    expect(loadPaintedBackdrop(loaders, plain).cliff).toBeNull();
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
