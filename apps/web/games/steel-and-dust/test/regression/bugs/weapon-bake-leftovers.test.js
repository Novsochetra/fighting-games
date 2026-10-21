import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { WEAPONS, WEAPON_IDS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: with bare fists the Firefly and Blue Shades still showed their sword in many frames, or a
// dotted line where it had been, and the Blue Shade's lit tunic was painted in the fists' gold. Their
// blades burn white at the core, edged in cyan or blue, and the weapon bake
// (tools/bake_hero_weapons.py) only counted colored glow: it found the Firefly Shade's spark arcs
// instead of its blade, left the white core behind when it took a blade away, and took the glowing
// tunic for a slash smear
const GAME = new URL('../../../', import.meta.url);
const { frameWidth } = HERO_SPRITES;
const STRIPS = Object.keys(HERO_SPRITES.frames).filter((strip) => strip !== 'ult');
const SWINGS = new Set([
  'slash1',
  'slash2',
  'spin_slash',
  'thrust',
  'rising_dragon',
  'cleave',
  'air_slash',
  'air_rising_cut',
  'meteor_slash',
  'plunge',
]);
// a blade's white core is a streak; a lit face or an eye's glint is a few pixels across. Only white
// that lay on the drawn sword counts: the Shade's own frost and fireflies are drawn in every row
const PALE = 190;
const LONGEST_HIGHLIGHT = 5;
// the colors the bake paints a smear in the fists row (`RAMPS['fists']`)
const FISTS_SMEAR = new Set(['9a4a1a', 'e8822a', 'ffd23f', 'fff3b0']);
// where his hand closed on the hilt a few of its pixels may take the smear's gold
const GOLD_AT_THE_HILT = 8;
const NEIGHBOURS = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => [dx, dy]));

// a row of the arsenal strip, each frame with the same frame of the drawn sword strip it was baked from
function frames(heroId, strip, weapon) {
  const hero = HEROES.find(({ id }) => id === heroId);
  const image = readPngAlpha(new URL(`${hero.directory}hero_${strip}.png`, GAME));
  const drawn = readPngAlpha(new URL(`${hero.directory}../hero_${strip}.png`, GAME));
  const height = image.height / WEAPON_IDS.length;
  const top = WEAPONS[weapon].spriteRow * height;
  return Array.from({ length: HERO_SPRITES.frames[strip] }, (_, index) => ({
    image,
    left: index * frameWidth,
    top,
    height,
    drawn: { image: drawn, left: index * frameWidth, top: 0 },
  }));
}

function pixel({ image, left, top }, x, y) {
  return { alpha: image.alpha(left + x, top + y), rgb: image.rgb(left + x, top + y) };
}

function whiteAt(frame, x, y) {
  const { alpha, rgb } = pixel(frame, x, y);
  return alpha > 0 && Math.min(...rgb) >= PALE;
}

function paleAt(frame, x, y) {
  return whiteAt(frame, x, y) && whiteAt(frame.drawn, x, y);
}

// the longest side of the box round one run of white pixels touching each other
function streakFrom(frame, start, seen) {
  const stack = [start];
  const box = { left: start[0], right: start[0], top: start[1], bottom: start[1] };
  while (stack.length) {
    const [x, y] = stack.pop();
    const key = y * frameWidth + x;
    const inside = x >= 0 && y >= 0 && x < frameWidth && y < frame.height;
    if (!inside || seen.has(key) || !paleAt(frame, x, y)) {
      continue;
    }
    seen.add(key);
    Object.assign(box, {
      left: Math.min(box.left, x),
      right: Math.max(box.right, x),
      top: Math.min(box.top, y),
      bottom: Math.max(box.bottom, y),
    });
    stack.push(...NEIGHBOURS.map(([dx, dy]) => [x + dx, y + dy]));
  }
  return Math.max(box.right - box.left, box.bottom - box.top) + 1;
}

function longestStreak(frame) {
  const seen = new Set();
  let longest = 0;
  for (let y = 0; y < frame.height; y++) {
    for (let x = 0; x < frameWidth; x++) {
      if (!seen.has(y * frameWidth + x) && paleAt(frame, x, y)) {
        longest = Math.max(longest, streakFrom(frame, [x, y], seen));
      }
    }
  }
  return longest;
}

// his tunic and armour in the sword row: strong blue, not a blade's white
function armourAt(frame, x, y) {
  const { alpha, rgb } = pixel(frame, x, y);
  const [red, , blue] = rgb;
  return alpha > 0 && blue >= 150 && blue - red >= 100 && Math.min(...rgb) < PALE;
}

function goldOnArmour(fists, sword) {
  let count = 0;
  for (let y = 0; y < fists.height; y++) {
    for (let x = 0; x < frameWidth; x++) {
      const { alpha, rgb } = pixel(fists, x, y);
      const hex = rgb.map((value) => value.toString(16).padStart(2, '0')).join('');
      count += alpha > 0 && FISTS_SMEAR.has(hex) && armourAt(sword, x, y) ? 1 : 0;
    }
  }
  return count;
}

// out of a swing a white streak where the sword was drawn can only be the sword; a swing's smear keeps
// its white core in every row, as it always has
const STILL = STRIPS.filter((strip) => !SWINGS.has(strip));

describe.each(['firefly', 'blue'])('the %s Shade with bare fists', (heroId) => {
  it.each(STILL)('leaves no streak of his blade behind in any %s frame', (strip) => {
    const leftovers = frames(heroId, strip, 'fists')
      .map((frame, index) => ({ index, streak: longestStreak(frame) }))
      .filter(({ streak }) => streak > LONGEST_HIGHLIGHT);
    expect(leftovers).toEqual([]);
  });
});

describe('the Blue Shade with bare fists', () => {
  it.each(STILL)('keeps his lit tunic and armour blue in every %s frame', (strip) => {
    const swords = frames('blue', strip, 'sword');
    const gilded = frames('blue', strip, 'fists')
      .map((fists, index) => ({ index, pixels: goldOnArmour(fists, swords[index]) }))
      .filter(({ pixels }) => pixels > GOLD_AT_THE_HILT);
    expect(gilded).toEqual([]);
  });
});
