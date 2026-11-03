import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VIEW } from '../../../../src/config.js';
import { CLOSING_CARD } from '../../../../src/data/story/closing.js';
import { setBackdropCanvasFactory } from '../../../../src/render/backdrops/index.js';
import { ART_SCALE } from '../../../../src/render/backdrops/raster.js';
import {
  CLOSING_BAND,
  CLOSING_BEATS,
  drawClosingCard,
} from '../../../../src/render/title/closing-card.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

// what drawText writes, its shadow left out
function drawnTexts({ lang, age }) {
  const target = createPixelCanvas(VIEW.width, VIEW.height).getContext('2d');
  const texts = [];
  const context = new Proxy(target, {
    get(real, name) {
      const value = real[name];

      if (name === 'fillText') {
        return (text, x, y) => {
          texts.push({ text, x, y, width: real.measureText(text).width });
          value(text, x, y);
        };
      }

      return typeof value === 'function' ? value.bind(real) : value;
    },
    set(real, name, value) {
      real[name] = value;

      return true;
    },
  });

  drawClosingCard(context, { ...CLOSING_CARD, lang, tick: 0, age });

  return { texts: texts.filter((_, i) => i % 2 === 1) };
}

describe('the closing card', () => {
  beforeEach(() => setBackdropCanvasFactory(null));
  afterEach(() => setBackdropCanvasFactory(null));

  it('shows the trophy first, then the end, then the moral', () => {
    expect(drawnTexts({ lang: 'en', age: 0 }).texts).toEqual([]);
    expect(
      drawnTexts({ lang: 'en', age: CLOSING_BEATS.title }).texts.map(({ text }) => text),
    ).toEqual(['THE END']);
    expect(drawnTexts({ lang: 'en', age: CLOSING_BEATS.moral }).texts.length).toBeGreaterThan(2);
  });

  it('keeps every word on its band and inside the view, in both languages', () => {
    const top = CLOSING_BAND.y * ART_SCALE;
    const bottom = (CLOSING_BAND.y + CLOSING_BAND.height) * ART_SCALE;

    for (const lang of ['en', 'km']) {
      const { texts } = drawnTexts({ lang, age: 200 });

      expect(texts.map(({ text }) => text).join(' ')).toContain(
        lang === 'en' ? 'trophy' : 'ពានរង្វាន់',
      );

      for (const { x, y, width } of texts) {
        expect(y).toBeGreaterThanOrEqual(top);
        expect(y).toBeLessThan(bottom - 16);
        expect(x - width / 2).toBeGreaterThan(0);
        expect(x + width / 2).toBeLessThan(VIEW.width);
      }
    }
  });
});
