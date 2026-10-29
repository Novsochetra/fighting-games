import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readPngAlpha } from '../support/png-alpha.js';

const GAME = new URL('../../', import.meta.url);
const TOKENS = readFileSync(new URL('styles/tokens.css', GAME), 'utf8');
const PIECES = ['left', 'left-foot', 'right', 'right-foot'];
const PLASTIC = [
  'landscape-left',
  'landscape-left-foot',
  'landscape-right',
  'landscape-right-foot',
  'portrait-body',
  'portrait-foot',
];
// the plastic the keys stand on, inside the rim, the bezel's outline and the line under the screen
// that run round each piece's edge
const EDGE = 24;
// darker than the rim's shade and that line: the speaker's slots and the screws
const DARK = 240;

const tokenColour = (name) => {
  const hex = TOKENS.match(new RegExp(`--${name}: #([0-9a-f]{6});`))[1];

  return [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16));
};

// the share of a piece's painted pixels within `near` of a colour: close, as the shell's own dark
// grey edge is only 19 from the bezel's purple
function shareOf(path, colour, near = 16) {
  const art = readPngAlpha(path);
  let painted = 0;
  let matching = 0;

  for (let y = 0; y < art.height; y++) {
    for (let x = 0; x < art.width; x++) {
      if (art.alpha(x, y) > 0) {
        const distance = art
          .rgb(x, y)
          .reduce((sum, value, i) => sum + Math.abs(value - colour[i]), 0);

        painted += 1;
        matching += distance < near ? 1 : 0;
      }
    }
  }

  return matching / painted;
}

// the pixels on the plastic under the keys darker than its rim's shade, or as red as an LED
function marksOn(art) {
  const marks = [];

  for (let y = EDGE; y < art.height - EDGE; y++) {
    for (let x = EDGE; x < art.width - EDGE; x++) {
      const [red, green, blue] = art.rgb(x, y);
      const lit = art.alpha(x, y) > 0;

      if (lit && (red + green + blue < DARK || red - green > 60)) {
        marks.push([x, y]);
      }
    }
  }

  return marks;
}

describe("Retro Grey's grips held sideways", () => {
  // the grips took in the purple bezel round the screen, its inner 46 px beside the game, so the
  // d-pad, HEAVY and the pills stood on the bezel: a grip is the grey plastic alone, and the bezel
  // the window's own colour round the game
  it('are its grey plastic, the purple bezel left to the window round the game', () => {
    const bezel = tokenColour('color-retro-bezel');

    for (const piece of PIECES) {
      const path = new URL(`assets/skins/retro/landscape-${piece}.png`, GAME);

      expect(shareOf(path, bezel), piece).toBeLessThan(0.01);
    }
  });

  // the painting's LED, screws and speaker grille stood under the d-pad and the keys, showing round
  // them: the plastic under the keys is plain, but for its own faint grain
  it('show no LED, screws or speaker on their plain plastic', () => {
    for (const piece of PLASTIC) {
      const marks = marksOn(readPngAlpha(new URL(`assets/skins/retro/${piece}.png`, GAME)));

      expect(marks.length, `${piece} ${marks.slice(0, 3).join(' ')}`).toBe(0);
    }
  });
});
