import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops.js';
import { createPainter } from '../../../src/render/painter.js';
import {
  drawPaintedBackdrop,
  loadPaintedBackdrop,
} from '../../../src/render/scene/painted-backdrop.js';
import { FakeImage } from '../../support/fake-image.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const loaders = { createImage: () => new FakeImage(), baseUrl: '' };

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
    expect(backdrop.painted).toBe(true);
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

  it('skip a layer until its image has loaded', () => {
    const { draws } = record([strip(320, 0.08, false), strip(0, 0.45)], 500);
    expect(draws).toEqual([]);
  });
});
