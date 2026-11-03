import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VIEW } from '../../../src/config.js';
import { setBackdropCanvasFactory } from '../../../src/render/backdrops/index.js';
import { drawChapterCard } from '../../../src/render/title/index.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';

// The band the chapter's name is written on was a half-and-half checker of dark over the picture:
// over chapters 3 and 4's bright night pitch it read as noisy green dots, with the centre circle's
// line running through the title

// the rows the number and the title are written across, in canvas pixels
const WORDS = { top: 284, bottom: 344 };

const lightAt = (canvas, x, y) => {
  const at = (y * canvas.width + x) * 4;
  const [red, green, blue] = canvas.data.subarray(at, at + 3);

  return 0.3 * red + 0.59 * green + 0.11 * blue;
};

function lightsUnderWords(number) {
  const canvas = createPixelCanvas(VIEW.width, VIEW.height);
  const lights = [];

  drawChapterCard(canvas.getContext('2d'), { number, tick: 0 });

  for (let y = WORDS.top; y < WORDS.bottom; y += 1) {
    for (let x = 0; x < VIEW.width; x += 1) {
      lights.push(lightAt(canvas, x, y));
    }
  }

  return lights;
}

describe('a chapter card’s band', () => {
  beforeEach(() => setBackdropCanvasFactory(null));
  afterEach(() => setBackdropCanvasFactory(null));

  it('stays dark and even under the words on every card', () => {
    for (const number of [1, 2, 3, 4]) {
      const lights = lightsUnderWords(number);

      expect(Math.max(...lights), `chapter ${number}`).toBeLessThan(40);
    }
  });
});
