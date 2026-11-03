import { afterEach, describe, expect, it } from 'vitest';
import { TITLE_ART } from '../../../../src/art/title/palette.js';
import { VIEW } from '../../../../src/config.js';
import { setBackdropCanvasFactory } from '../../../../src/render/backdrops/index.js';
import { colorOf } from '../../../../src/render/backdrops/raster.js';
import { drawChapterCard, drawTitleArt } from '../../../../src/render/title/index.js';
import { CARD_BAND } from '../../../../src/render/title/chapter-cards.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

function drawn(draw) {
  const canvas = createPixelCanvas(VIEW.width, VIEW.height);

  draw(canvas.getContext('2d'));

  return canvas.data;
}

const sameImage = (first, second) => first.every((value, i) => value === second[i]);
const opaque = (data) => data.filter((_, i) => i % 4 === 3).every((alpha) => alpha === 255);

function colorsIn(data, { x, y, width, height }) {
  const found = new Set();

  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      const at = (row * VIEW.width + column) * 4;

      found.add(`${data[at]},${data[at + 1]},${data[at + 2]}`);
    }
  }

  return found;
}

afterEach(() => setBackdropCanvasFactory(null));

describe('the title art', () => {
  setBackdropCanvasFactory(null);

  it('fills the view and moves its embers and glints with the tick', () => {
    const still = drawn((context) => drawTitleArt(context, { tick: 0 }));

    expect(opaque(still)).toBe(true);
    expect(
      sameImage(
        still,
        drawn((context) => drawTitleArt(context, { tick: 0 })),
      ),
    ).toBe(true);
    expect(
      sameImage(
        still,
        drawn((context) => drawTitleArt(context, { tick: 23 })),
      ),
    ).toBe(false);
  });

  it('leaves the upper middle to the sky, with none of the Naga in it, for the name', () => {
    const data = drawn((context) => drawTitleArt(context, { tick: 0 }));
    const naga = new Set(
      [...TITLE_ART.jade, ...TITLE_ART.gold].map((hex) => colorOf(hex).slice(0, 3).join(',')),
    );
    const upperMiddle = colorsIn(data, { x: 200, y: 16, width: 368, height: 60 });

    expect([...upperMiddle].filter((color) => naga.has(color))).toEqual([]);
  });
});

describe('the chapter cards', () => {
  setBackdropCanvasFactory(null);

  const cards = [1, 2, 3, 4].map((number) =>
    drawn((context) => drawChapterCard(context, { number, tick: 0 })),
  );

  it('fills the view for each of the four chapters, each its own place', () => {
    cards.forEach((card, i) => {
      expect(opaque(card)).toBe(true);
      cards.slice(i + 1).forEach((other) => expect(sameImage(card, other)).toBe(false));
    });
  });

  it('darkens a band for the chapter name inside the picture', () => {
    expect(CARD_BAND.y).toBeGreaterThan(0);
    expect(CARD_BAND.y + CARD_BAND.height).toBeLessThan(216);
  });

  it('falls back to the first card for a chapter it does not know', () => {
    expect(
      sameImage(
        drawn((context) => drawChapterCard(context, { number: 9, tick: 0 })),
        cards[0],
      ),
    ).toBe(true);
  });

  it('lets fireworks go up over the world stage', () => {
    const later = drawn((context) => drawChapterCard(context, { number: 4, tick: 50 }));

    expect(sameImage(cards[3], later)).toBe(false);
  });
});
