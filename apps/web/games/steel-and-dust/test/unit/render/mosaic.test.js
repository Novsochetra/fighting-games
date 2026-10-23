import { describe, expect, it } from 'vitest';
import { createView } from '../../../src/render/create-view.js';
import { pixelate } from '../../../src/render/overlays/mosaic.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';

const createCanvas = (width, height) => Object.assign(new RecordingCanvas(), { width, height });

function mosaicView() {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  return { view, log: screen.recording.log };
}

describe('the mosaic', () => {
  it('leaves the frame alone at a block of one pixel', () => {
    const { view, log } = mosaicView();
    log.length = 0;
    pixelate(view.painter, view, 1);
    expect(log).toEqual([]);
  });

  it('shrinks the frame drawn so far to a sample a block and lays it back over the view', () => {
    const { view, log } = mosaicView();
    log.length = 0;
    pixelate(view.painter, view, 4);
    const small = view.mosaic.recording.log;
    expect(small[0]).toBe('imageSmoothingEnabled=false');
    expect(small[1]).toMatch(/^drawImage\(canvas\(768x432,\w+\),0,0,768,432,0,0,96,54\)$/);
    expect(log).toHaveLength(1);
    expect(log[0]).toMatch(/^drawImage\(canvas\(192x108,\w+\),0,0,96,54,0,0,384,216\)$/);
  });
});
