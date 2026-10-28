import { describe, expect, it } from 'vitest';
import { drawLayerSpan, layerOrigin } from '../../../src/render/scene/layer-spans.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const image = (width) => ({ width, height: 216, recordingId: () => 'img' });
const STILL = { x: 0, y: 0 };

function drawn(layer, span) {
  const { context, log } = createRecordingContext(null);

  drawLayerSpan(context, layer, { cameraX: 0, shake: STILL, dx: 0, dy: 0, ...span });

  return log.map((entry) => entry.replace('drawImage(img,', '').replace(')', ''));
}

describe('a span of a painted layer laid on the screen', () => {
  it('starts where the layer is laid, rounded as the backdrop lays it', () => {
    const layer = { image: image(320), parallax: 0.45 };

    expect(layerOrigin(layer, 100)).toBe(-45);
    expect(layerOrigin(layer, 1000)).toBe(-130);
    expect(layerOrigin({ ...layer, once: true }, 1000)).toBe(-450);
  });

  it('takes a moved span from back where the move came from, and a shaken one from the shake', () => {
    const layer = { image: image(320), parallax: 0 };

    expect(drawn(layer, { x: 50, y: 10, width: 8, height: 3, dx: 2, dy: 1 })).toEqual([
      '48,9,8,3,50,10,8,3',
    ]);
    expect(drawn(layer, { x: 50, y: 10, width: 8, height: 3, shake: { x: -1, y: 2 } })).toEqual([
      '51,8,8,3,50,10,8,3',
    ]);
  });

  it('runs across the seam where a repeating layer starts again', () => {
    const layer = { image: image(100), parallax: 0 };

    expect(drawn(layer, { x: 95, y: 0, width: 10, height: 2 })).toEqual([
      '95,0,5,2,95,0,5,2',
      '0,0,5,2,100,0,5,2',
    ]);
  });

  it('leaves out what lies past either end of a single painting', () => {
    const layer = { image: image(100), parallax: 0, once: true };

    expect(drawn(layer, { x: 95, y: 0, width: 10, height: 2 })).toEqual(['95,0,5,2,95,0,5,2']);
    expect(drawn(layer, { x: 120, y: 0, width: 10, height: 2 })).toEqual([]);
  });

  it('carries the painting on above its top for rows moved down from there', () => {
    const layer = { image: image(100), parallax: 0 };

    expect(drawn(layer, { x: 10, y: 0, width: 4, height: 5, dy: 2 })).toEqual([
      '10,0,4,1,10,0,4,2',
      '10,0,4,3,10,2,4,3',
    ]);
  });
});
