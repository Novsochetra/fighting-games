import { describe, expect, it } from 'vitest';
import { HERO_SPRITES, stripPath } from '../../../src/data/hero-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { WEAPON_IDS, WEAPONS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: as the Antler Spirit Shade flinched, the ring of teal spirit fire his hit throws off took the
// fists' gold, the spear's ice blue and the axe's ember: the weapon bake (tools/bake_hero_weapons.py)
// recolours a swing's smear with each weapon, and took the ring for one. Where his blade is flung out
// of the drawing it took the ring for the blade as well, and stood the spear and the axe up on it,
// out in the air beside him
const GAME = new URL('../../../', import.meta.url);
const ANTLER = HEROES.find(({ id }) => id === 'antler');
const { frameWidth } = HERO_SPRITES;
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
const DRAWN = Object.keys(HERO_SPRITES.frames).filter((strip) => strip !== 'ult');
const STILL = DRAWN.filter((strip) => !SWINGS.has(strip));
// the colors the bake paints a swing in with each weapon (`RAMPS`)
const SMEAR = {
  fists: new Set(['9a4a1a', 'e8822a', 'ffd23f', 'fff3b0']),
  spear: new Set(['2a5f9e', '4fb0ff', 'a8e6ff', 'f2fdff']),
  axe: new Set(['8e2a1c', 'e0603a', 'ffa640', 'ffeec0']),
};
// a pixel or two of his glow beside the blade goes with its glint
const SPECKS = 2;
// his cloak, hands and outline are dark, his glow and a swing's smear are bright
const DARK = 120;
// fewer pixels than this are a fleck of a weapon's glint, not the weapon
const WEAPON_PART = 12;

function antlerSheet(strip) {
  const image = readPngAlpha(new URL(stripPath(ANTLER, strip), GAME));
  return { image, height: image.height / WEAPON_IDS.length, frames: HERO_SPRITES.frames[strip] };
}

function pixelAt({ image, height }, weapon, { x, y }) {
  const at = [x, WEAPONS[weapon].spriteRow * height + y];
  const rgb = image.rgb(...at);
  const hex = rgb.map((value) => value.toString(16).padStart(2, '0')).join('');
  return { drawn: image.alpha(...at) > 0, rgb, hex };
}

function isTeal({ drawn, rgb: [red, green] }) {
  return drawn && green - red >= 40 && green >= 100;
}

function everyPixel(sheet, frame, visit) {
  for (let y = 0; y < sheet.height; y++) {
    for (let x = 0; x < frameWidth; x++) {
      visit({ x: frame * frameWidth + x, y }, y * frameWidth + x);
    }
  }
}

function recolored(sheet, weapon, frame) {
  let pixels = 0;
  everyPixel(sheet, frame, (at) => {
    const now = pixelAt(sheet, weapon, at);
    pixels +=
      isTeal(pixelAt(sheet, 'sword', at)) && now.drawn && SMEAR[weapon].has(now.hex) ? 1 : 0;
  });
  return pixels;
}

// what a weapon row draws that the fists row does not, a swing's smear in its own colors aside
function weaponAndBody(sheet, weapon, frame) {
  const held = new Uint8Array(frameWidth * sheet.height);
  const body = new Uint8Array(frameWidth * sheet.height);
  everyPixel(sheet, frame, (at, index) => {
    const now = pixelAt(sheet, weapon, at);
    const bare = pixelAt(sheet, 'fists', at);
    held[index] = now.drawn && (!bare.drawn || now.hex !== bare.hex) && !SMEAR[weapon].has(now.hex);
    body[index] = bare.drawn && !held[index] && Math.max(...bare.rgb) < DARK;
  });
  return { held, body, height: sheet.height };
}

function neighbors(index, height) {
  const [x, y] = [index % frameWidth, Math.floor(index / frameWidth)];
  const around = [-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => [x + dx, y + dy]));
  return around
    .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < frameWidth && ny < height)
    .map(([nx, ny]) => ny * frameWidth + nx);
}

function partFrom(mask, start, height) {
  const part = [start];
  mask[start] = 0;
  for (let i = 0; i < part.length; i++) {
    const next = neighbors(part[i], height).filter((index) => mask[index]);
    next.forEach((index) => (mask[index] = 0));
    part.push(...next);
  }
  return part;
}

function loosePieces(sheet, weapon, frame) {
  const { held, body, height } = weaponAndBody(sheet, weapon, frame);
  const loose = [];
  for (let start = 0; start < held.length; start++) {
    const part = held[start] ? partFrom(held, start, height) : [];
    const touches = part.some((index) => neighbors(index, height).some((near) => body[near]));
    if (part.length >= WEAPON_PART && !touches) {
      loose.push(part.length);
    }
  }
  return loose;
}

function framesWhere(sheet, weapons, count) {
  return weapons.flatMap((weapon) =>
    Array.from({ length: sheet.frames }, (_, frame) => ({
      weapon,
      frame,
      found: count(weapon, frame),
    })),
  );
}

describe('the Antler Spirit Shade', () => {
  it.each(STILL)('keeps his teal glow in every weapon row of his %s', (strip) => {
    const sheet = antlerSheet(strip);
    const found = framesWhere(sheet, ['fists', 'spear', 'axe'], (weapon, frame) =>
      recolored(sheet, weapon, frame),
    );
    expect(found.filter(({ found: pixels }) => pixels > SPECKS)).toEqual([]);
  });

  it.each(DRAWN)('holds his spear and axe in hand in every %s frame', (strip) => {
    const sheet = antlerSheet(strip);
    const found = framesWhere(sheet, ['spear', 'axe'], (weapon, frame) =>
      loosePieces(sheet, weapon, frame),
    );
    expect(found.filter(({ found: pieces }) => pieces.length > 0)).toEqual([]);
  });
});
