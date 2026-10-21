import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { pngSize } from '../../support/png-size.js';

const STYLES = new URL('../../../styles/', import.meta.url);
const HEROES_DIR = new URL('../../../assets/sprites/heroes/', import.meta.url);
const imagesIn = (css) =>
  [...css.matchAll(/url\('([^']+)'\)/g)].map((match) => new URL(match[1], STYLES));

describe('the hero select cards', () => {
  const css = ['heroes.css', 'hero-cards.css', 'hero-frames.css', 'hero-scene.css']
    .map((file) => readFileSync(new URL(file, STYLES), 'utf8'))
    .join('\n');

  it('draws only images that are there', () => {
    const images = imagesIn(css);
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(existsSync(image), image.pathname).toBe(true);
    }
  });

  it('holds Bokator on the first frame of his smaller win pose in the middle of the carousel', () => {
    const picked = css.match(
      /\.hero-card\[data-hero='bokator'\]\[data-depth='0'\] \.hero-art \{([^}]*)\}/,
    );
    expect(picked[1]).toContain('card_win.png');
    expect(picked[1]).toContain('animation: none;');
  });

  // the middle hero's sprite window is twice as wide as its button and hangs over the side cards,
  // where it took the taps meant for them and started the run
  it('takes a tap only on a card button the height of its sprite, never on the window over it', () => {
    const rule = (selector) => css.match(new RegExp(`\\n${selector} \\{([^}]*)\\}`))[1];
    expect(rule('\\.hero-art')).toContain('pointer-events: none;');
    expect(rule('\\.hero-card')).toContain('width: calc(var(--px) * 64px);');
    expect(rule('\\.hero-card')).toContain('height: calc(var(--px) * 80px);');
  });

  it("plays the Angkor Warrior's smaller win pose in the middle of the carousel, glow and all", () => {
    const picked = css.match(
      /\.hero-card\[data-hero='angkor'\]\[data-depth='0'\] \.hero-art \{([^}]*)\}/,
    );
    expect(picked[1]).toContain('angkor/card_win.png');
    expect(picked[1]).not.toContain('animation: none;');
  });

  // the cards were spaced by a fixed step whatever their scale, so the gaps between frames grew toward
  // the edges, and each shrank toward the hero's feet, so the small frames sat low
  it('spaces every card by the same gap after the one before it, all on one middle line', () => {
    const rule = (selector) => css.match(new RegExp(`\\n${selector} \\{([^}]*)\\}`))[1];
    const depth = (level) => rule(`\\.hero-card\\[data-depth='${level}'\\]`);
    expect(rule('\\.hero-card')).toContain('transform-origin: 50% var(--card-middle);');
    expect(depth(1)).toContain('--offset: calc(var(--slot) * var(--reach-near));');
    expect(depth(2)).toContain('--offset: calc(var(--slot) / 2 * var(--reach-far));');
    expect(depth(3)).toContain('--offset: calc(var(--slot) / 3 * var(--reach-out));');
    expect(css).not.toContain('--slot-gap');
  });

  it.each(['bokator', 'angkor'])(
    "draws the %s hero's smaller win pose in frames the size of his win strip's",
    (hero) => {
      const card = pngSize(new URL(`${hero}/card_win.png`, HEROES_DIR).pathname);
      const win = pngSize(new URL(`${hero}/arsenal/hero_win.png`, HEROES_DIR).pathname);
      expect(card).toEqual({ width: win.width, height: win.height / 4 });
    },
  );
});
