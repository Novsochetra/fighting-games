import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { pngSize } from '../../support/png-size.js';

const STYLES = new URL('../../../styles/', import.meta.url);
const HEROES_DIR = new URL('../../../assets/sprites/heroes/', import.meta.url);
const imagesIn = (css) =>
  [...css.matchAll(/url\('([^']+)'\)/g)].map((match) => new URL(match[1], STYLES));

describe('the hero select cards', () => {
  const css = readFileSync(new URL('heroes.css', STYLES), 'utf8');

  it('draws only images that are there', () => {
    const images = imagesIn(css);
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(existsSync(image), image.pathname).toBe(true);
    }
  });

  it.each(['bokator', 'angkor'])(
    "plays the %s hero's smaller win pose in frames the size of his win strip's",
    (hero) => {
      const card = pngSize(new URL(`${hero}/card_win.png`, HEROES_DIR).pathname);
      const win = pngSize(new URL(`${hero}/arsenal/hero_win.png`, HEROES_DIR).pathname);
      expect(card).toEqual({ width: win.width, height: win.height / 4 });
    },
  );
});
