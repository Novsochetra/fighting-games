import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SPRITES } from '../../../src/data/sprites.js';
import { createActorArt, loadSprites, prepareMatchArt } from '../../../src/render/actors/index.js';
import { numberAnchorsOf } from '../../../src/render/actors/number-anchors.js';
import { frameRuns } from '../../../src/render/duel/clash/sprite-mask.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { decodePng } from '../../support/png.js';

// Chrome warned over and over that canvases read back with getImageData had not asked for
// willReadFrequently: each recoloured sheet was read once as it was painted and again when a duel's
// clash took its shape, and the canvases made only to be read (the throw-in's sheet, the shirt
// mask) asked for nothing. A canvas made to be read now asks to be read often, and the sheets the
// pitch draws every frame keep the default, read at most once.

const GAME = fileURLToPath(new URL('../../../', import.meta.url));
const loadImage = async (source) => decodePng(readFileSync(`${GAME}${source}`));
const sprites = await loadSprites(SPRITES, { loadImage });

// a canvas factory that keeps, for each canvas it makes, whether its context asked to be read
// often (only the first ask counts, as in a browser) and how often it was read back
function watchedCanvases() {
  const made = [];

  const createCanvas = (width, height) => {
    const canvas = createPixelCanvas(width, height);
    const own = canvas.getContext;
    const entry = { canvas, willRead: null, reads: 0 };

    canvas.getContext = (kind, options) => {
      entry.willRead ??= options?.willReadFrequently === true;

      const context = own(kind);
      const read = (...args) => {
        entry.reads += 1;

        return context.getImageData(...args);
      };

      return new Proxy(context, {
        get: (target, name) => (name === 'getImageData' ? read : target[name]),
        set: (target, name, value) => Reflect.set(target, name, value),
      });
    };
    made.push(entry);

    return canvas;
  };

  return { made, createCanvas };
}

// a match's art made as a match starts, then every sheet's shape taken, as a duel's clash does
function playedArt() {
  const watched = watchedCanvases();
  const art = createActorArt({ sprites, createCanvas: watched.createCanvas });

  prepareMatchArt(art, createMatch({ seed: 2, format: '7', halfSeconds: 60 }));
  numberAnchorsOf(art);

  const sheets = [...art.sheets.values()].flatMap((byAnimation) => [...byAnimation.values()]);

  for (const sheet of sheets) {
    frameRuns(sheet, { x: 0, y: 0, width: SPRITES.frame.width, height: SPRITES.frame.height });
  }

  return { made: watched.made, sheets: new Set(sheets) };
}

describe('the canvases the players are painted on', () => {
  const { made, sheets } = playedArt();
  const drawn = made.filter((entry) => sheets.has(entry.canvas));
  const others = made.filter((entry) => !sheets.has(entry.canvas));

  it('read none back twice without asking to be read often', () => {
    expect(made.filter((entry) => entry.reads > 1 && !entry.willRead)).toEqual([]);
  });

  it('keep the default for the sheets the pitch draws every frame, each read at most once', () => {
    expect(drawn.length).toBeGreaterThan(0);

    for (const entry of drawn) {
      expect(entry.willRead).toBe(false);
      expect(entry.reads).toBeLessThanOrEqual(1);
    }
  });

  it('ask to be read often for every canvas made to be read back', () => {
    const read = others.filter((entry) => entry.reads > 0);

    expect(read.length).toBeGreaterThan(0);
    expect(read.filter((entry) => !entry.willRead)).toEqual([]);
  });
});
