import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stripPath, stripRows } from '../../../src/data/hero-sprites.js';
import { HEROES, heroById } from '../../../src/data/heroes.js';
import { readPngAlpha } from '../../support/png-alpha.js';
import { pngSize } from '../../support/png-size.js';

const STYLES = new URL('../../../styles/', import.meta.url);
const HEROES_DIR = new URL('../../../assets/sprites/heroes/', import.meta.url);
const imagesIn = (css) =>
  [...css.matchAll(/url\('([^']+)'\)/g)].map((match) => new URL(match[1], STYLES));
const GAME = new URL('../../../', import.meta.url);
const KHMER = ['bokator', 'angkor'];

// the pixels of a card strip that differ from the first row of the strip it was cut from
function rowMismatches(card, source) {
  let wrong = 0;
  for (let y = 0; y < card.height; y++) {
    for (let x = 0; x < card.width; x++) {
      const alpha = card.alpha(x, y);
      const same =
        alpha === source.alpha(x, y) &&
        (alpha === 0 || card.colorKey(x, y) === source.colorKey(x, y));
      wrong += same ? 0 : 1;
    }
  }
  return wrong;
}
const LOOPS = KHMER.flatMap((hero) => [
  [hero, 'card_pose.png'],
  [hero, 'card_idle.png'],
]);
const FRAME = { width: 128, height: 112 };
const FEET_LINE = 108;
const FEET_ROWS = 5;
// the share of the first frame's feet a frame's feet cover, out of both; a slide of three pixels
// leaves about half
const SAME_SPOT = 0.6;

describe('the hero select cards', () => {
  const css = ['heroes.css', 'hero-cards.css', 'hero-frames.css', 'hero-scene.css']
    .map((file) => readFileSync(new URL(file, STYLES), 'utf8'))
    .join('\n');
  const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^}]*)\}/g)].map(
    ([, selectors, body]) => ({ selectors: selectors.split(',').map((one) => one.trim()), body }),
  );
  // every declaration made for a selector, whichever rule, alone or in a list, it is made in
  const declared = (selector) =>
    rules
      .filter((rule) => rule.selectors.includes(selector))
      .map((rule) => rule.body)
      .join('\n');

  it('draws only images that are there', () => {
    const images = imagesIn(css);
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(existsSync(image), image.pathname).toBe(true);
    }
  });

  // a re-baked strip without tools/pack_hero_strips.py run again after it fails here
  it.each(HEROES.filter((hero) => hero.cards.cutFrom).map((hero) => hero.id))(
    "shows the %s Shade's sword row, cut from its own idle and win strips",
    (id) => {
      const hero = heroById(id);
      for (const [slot, strip] of Object.entries(hero.cards.cutFrom)) {
        const card = readPngAlpha(new URL(hero.cards[slot], GAME));
        const source = readPngAlpha(new URL(stripPath(hero, strip), GAME));
        expect([card.width, card.height]).toEqual([source.width, source.height / stripRows(strip)]);
        expect(rowMismatches(card, source), `${id} ${slot}`).toBe(0);
      }
    },
  );

  // in his win sheet's other frames he turns his back, so Bokator's middle card held its first
  // frame, and both Khmer heroes stood still on the select screen while every Shade moved
  it.each(KHMER)(
    "plays the %s hero's drawn flourish in the middle, six frames at the idle's pace",
    (hero) => {
      const middle = declared(`.hero-card[data-hero='${hero}'][data-depth='0'] .hero-art`);
      expect(heroById(hero).cards.middle).toBe(`assets/sprites/heroes/${hero}/card_pose.png`);
      expect(middle).toContain(
        'animation: hero-idle var(--duration-sprite-idle) var(--easing-step-6) infinite;',
      );
      expect(middle).not.toContain('animation: none;');
    },
  );

  it.each(KHMER)("plays the %s hero's drawn guard on the side cards", (hero) => {
    const side = declared(`.hero-card[data-hero='${hero}'] .hero-art`);
    expect(heroById(hero).cards.side).toBe(`assets/sprites/heroes/${hero}/card_idle.png`);
    expect(side).toContain('background-size: calc(var(--px) * 768px) calc(var(--px) * 112px);');
  });

  // the middle hero's sprite window is twice as wide as its button and hangs over the side cards,
  // where it took the taps meant for them and started the run
  it('takes a tap only on a card button the height of its sprite, never on the window over it', () => {
    const rule = (selector) => css.match(new RegExp(`\\n${selector} \\{([^}]*)\\}`))[1];
    expect(rule('\\.hero-art')).toContain('pointer-events: none;');
    expect(rule('\\.hero-card')).toContain('width: calc(var(--px) * 64px);');
    expect(rule('\\.hero-card')).toContain('height: calc(var(--px) * 80px);');
  });

  // four hard shadows a sprite pixel out drew an outline round the middle hero, and round every
  // firefly, spore, wisp and ice mote drawn about him, which turned each into a blob of his color
  it('lights the middle hero with a glow centred on him, never a shifted hard outline', () => {
    const filter = declared(".hero-card[data-depth='0'] .hero-art").match(/filter:([^;]*);/)[1];
    const shadows = [...filter.matchAll(/drop-shadow\((\S+) (\S+) /g)];
    expect(shadows.length).toBeGreaterThan(0);
    for (const [, x, y] of shadows) {
      expect([x, y]).toEqual(['0', '0']);
    }
  });

  // his raised dav reached above the window, and the star at its point was cut off
  it("opens the Angkor Warrior's middle window higher over his dav, his feet where they were", () => {
    const middle = declared(".hero-card[data-hero='angkor'][data-depth='0'] .hero-art");
    const px = (name) =>
      Number(middle.match(new RegExp(`${name}: (?:0 )?calc\\(var\\(--px\\) \\* (-?\\d+)px\\)`))[1]);
    expect(px('height') - px('background-position')).toBe(FRAME.height);
    expect(px('height') + px('margin-top')).toBe(80);
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

  it.each(LOOPS)(
    'draws %s/%s as one row of as many 112 px tall frames as the cards step through',
    (hero, file) => {
      const size = pngSize(new URL(`${hero}/${file}`, HEROES_DIR).pathname);
      const steps = Number(declared('.hero-art').match(/var\(--easing-step-(\d+)\)/)[1]);
      const strip = Number(
        declared(`.hero-card[data-hero='${hero}'] .hero-art`).match(/\* (\d+)px\) calc/)[1],
      );
      expect(size).toEqual({ width: FRAME.width * steps, height: FRAME.height });
      expect(strip).toBe(size.width);
    },
  );

  // a loop that slid his feet would make him skate on the spot: every frame stands on the feet line,
  // its feet over most of where the first frame's are
  it.each(LOOPS)('keeps %s/%s standing on the same spot in every frame', (hero, file) => {
    const strip = readPngAlpha(new URL(`${hero}/${file}`, HEROES_DIR));
    const frames = strip.width / FRAME.width;
    const feet = (frame) =>
      Array.from({ length: FEET_ROWS * FRAME.width }, (_, at) => {
        const x = frame * FRAME.width + (at % FRAME.width);
        return strip.alpha(x, FEET_LINE - Math.floor(at / FRAME.width)) > 0;
      });
    const line = (frame, y) =>
      Array.from({ length: FRAME.width }, (_, x) => strip.alpha(frame * FRAME.width + x, y));
    const standing = feet(0);
    for (let frame = 0; frame < frames; frame++) {
      expect(
        line(frame, FEET_LINE).some((alpha) => alpha > 0),
        `frame ${frame}`,
      ).toBe(true);
      expect(
        line(frame, FEET_LINE + 1).every((alpha) => alpha === 0),
        `frame ${frame}`,
      ).toBe(true);
      const own = feet(frame);
      const both = own.filter((solid, at) => solid && standing[at]).length;
      const either = own.filter((solid, at) => solid || standing[at]).length;
      expect(both / either, `frame ${frame}`).toBeGreaterThan(SAME_SPOT);
    }
  });
});
