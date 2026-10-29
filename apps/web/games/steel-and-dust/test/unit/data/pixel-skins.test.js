import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PIXEL_SKINS } from '../../../src/data/skins/pixel.js';
import { pngSize } from '../../support/png-size.js';

const GAME = new URL('../../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, GAME), 'utf8');
const SHARED = read('styles/skin-pixel.css');

const declared = (css) =>
  new Set([...css.matchAll(/(--pixel-[\w-]+|--shadow-pixel-[\w-]+):/g)].map((match) => match[1]));
const used = (css) =>
  new Set([...css.matchAll(/var\((--(?:shadow-)?pixel-[\w-]+)/g)].map((match) => match[1]));

describe('the pixel skins', () => {
  // styles/skin-pixel.css paints every pixel skin from what its own stylesheet names; one it
  // leaves out would draw nothing there, with no error anywhere
  it('each name every piece of art and colour the shared stylesheet paints from', () => {
    const own = declared(SHARED);
    const needed = [...used(SHARED)].filter((name) => !own.has(name)).sort();

    expect(needed.length).toBeGreaterThan(15);

    for (const id of Object.keys(PIXEL_SKINS)) {
      const css = read(`styles/skin-${id}.css`);

      expect([...declared(css)].sort(), id).toEqual(needed);
      expect(css, id).toMatch(new RegExp(`^\\.${id} \\{`, 'm'));
    }
  });

  it('are each linked from the page after the shared stylesheet', () => {
    const page = read('index.html');
    const shared = page.indexOf('styles/skin-pixel.css');

    expect(shared).toBeGreaterThan(0);

    for (const id of Object.keys(PIXEL_SKINS)) {
      expect(page.indexOf(`styles/skin-${id}.css`), id).toBeGreaterThan(shared);
    }
  });

  it('shape their pills and size their grips as the art is', () => {
    for (const [id, skin] of Object.entries(PIXEL_SKINS)) {
      const pill = pngSize(new URL(`assets/skins/${id}/key-pill.png`, GAME));
      const grip = pngSize(new URL(`assets/skins/${id}/landscape-left.png`, GAME));
      const css = read(`styles/skin-${id}.css`);

      expect(skin.pills.landscape[0].aspect, id).toBeCloseTo(pill.height / pill.width, 2);
      expect(css, id).toContain(`--pixel-grip-pixels: ${grip.width};`);
    }
  });
});
