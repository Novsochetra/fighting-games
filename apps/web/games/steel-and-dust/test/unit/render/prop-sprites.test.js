import { describe, expect, it } from 'vitest';
import { PROP_SPRITES } from '../../../src/data/prop-sprites.js';
import { createPainter } from '../../../src/render/painter.js';
import {
  drawPropSprite,
  isSpriteProp,
  loadPropSprites,
} from '../../../src/render/scene/props/prop-sprites.js';
import { FakeImage } from '../../support/fake-image.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const loaders = { createImage: () => new FakeImage(), baseUrl: '' };

function drawCalls(sheets, prop) {
  const { context, log } = createRecordingContext(null);
  drawPropSprite(createPainter(context), sheets, prop);
  return log.filter((call) => call.startsWith('drawImage('));
}

describe('prop sprites', () => {
  it('load one sprite per prop, with its feet inside the sprite', () => {
    const sheets = loadPropSprites(loaders);
    for (const [kind, sprite] of Object.entries(PROP_SPRITES)) {
      const image = sheets.images[kind];
      expect(sheets.ready[kind], kind).toBe(true);
      expect(image.name, kind).toBe(sprite.file);
      expect(sprite.feetX, kind).toBeLessThan(image.width);
      expect(sprite.feetY, kind).toBeLessThanOrEqual(image.height);
      expect(image.width % 2, kind).toBe(0);
    }
  });

  it('tell sprite props from the drawn ones', () => {
    expect(isSpriteProp('palisade')).toBe(true);
    expect(isSpriteProp('barrel')).toBe(false);
  });

  it("draw at the fighters' density with the feet on the road", () => {
    const sheets = loadPropSprites(loaders);
    const { width, height } = sheets.images.palisade;
    const { feetX, feetY } = PROP_SPRITES.palisade;
    expect(drawCalls(sheets, { kind: 'palisade', x: 500, y: 184 })).toEqual([
      `drawImage(img(palisade.png),${Math.round(500 - feetX / 2)},${Math.round(184 - feetY / 2)},${width / 2},${height / 2})`,
    ]);
  });

  it('draw nothing until the sprite has loaded', () => {
    const sheets = { images: { palisade: new FakeImage() }, ready: {} };
    expect(drawCalls(sheets, { kind: 'palisade', x: 500, y: 184 })).toEqual([]);
  });
});
