import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SPRITE_KIT } from '../../../src/art/sprite-kit.js';
import { SPRITES } from '../../../src/data/sprites.js';
import { decodePng } from '../../support/png.js';

const GAME = join(import.meta.dirname, '../../..');
const PNG_SIGNATURE = '89504e470d0a1a0a';

// the outline, the boots' three shades and the white of eyes and teeth: no look recolours them
const FIXED = ['#000000', '#100f12', '#232223', '#56555e', '#f2eae0'];

// closer than this to a shirt shade, a colour would read as shirt but keep its colour in any kit
const NEAR_SHIRT = 32;

const animations = Object.entries(SPRITES.animations);
const { width, height } = SPRITES.frame;

const drawnRows = (rows) => Object.values(rows).filter((entry) => typeof entry === 'number');
const sheetOf = (animation) => decodePng(readFileSync(join(GAME, animation.image)));
const hexAt = (data, at) =>
  `#${[0, 1, 2].map((channel) => data[at + channel].toString(16).padStart(2, '0')).join('')}`;
const rgbOf = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
const distance = (first, second) => Math.hypot(...first.map((value, i) => value - second[i]));

function opaqueColours() {
  const colours = new Set();

  for (const [, animation] of animations) {
    const { data } = sheetOf(animation);

    for (let at = 0; at < data.length; at += 4) {
      if (data[at + 3] > 0) {
        colours.add(hexAt(data, at));
      }
    }
  }

  return colours;
}

function cellRows(sheet, { column, row }) {
  const filled = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = ((row * height + y) * sheet.width + column * width + x) * 4;

      if (sheet.data[at + 3] > 0) {
        filled.push(y);
        break;
      }
    }
  }

  return filled;
}

describe('the footballer sprite sheets', () => {
  it('names the eight ways in order, and anchors the feet mid-frame so a mirror lines up', () => {
    expect(SPRITES.directions).toEqual([
      'south',
      'south-east',
      'east',
      'north-east',
      'north',
      'north-west',
      'west',
      'south-west',
    ]);
    expect(SPRITES.anchor.x).toBe(width / 2);
    expect(SPRITES.anchor.y).toBeGreaterThan(0);
    expect(SPRITES.anchor.y).toBeLessThanOrEqual(height);
  });

  it.each(animations)(
    '%s is a png of its frames across and its drawn rows down',
    (_, animation) => {
      const file = join(GAME, animation.image);
      const rows = drawnRows(animation.rows);

      expect(existsSync(file)).toBe(true);
      expect(readFileSync(file).subarray(0, 8).toString('hex')).toBe(PNG_SIGNATURE);
      expect(new Set(rows).size).toBe(Math.max(...rows) + 1);
      expect(sheetOf(animation)).toMatchObject({
        width: animation.frames * width,
        height: (Math.max(...rows) + 1) * height,
      });
    },
  );

  it.each(animations)('%s draws a player in every frame of every row it names', (_, animation) => {
    const sheet = sheetOf(animation);

    for (const row of drawnRows(animation.rows)) {
      for (let column = 0; column < animation.frames; column += 1) {
        expect(
          cellRows(sheet, { column, row }).length,
          `row ${row} frame ${column}`,
        ).toBeGreaterThan(10);
      }
    }
  });

  it.each(animations)('%s names only real ways, and mirrors only rows it drew', (_, animation) => {
    for (const [direction, entry] of Object.entries(animation.rows)) {
      expect(SPRITES.directions).toContain(direction);

      if (typeof entry !== 'number') {
        expect(
          typeof animation.rows[entry.mirrorOf],
          `${direction} mirrors ${entry.mirrorOf}`,
        ).toBe('number');
      }
    }
  });

  it('stands every way on the anchor: the soles touch the line above it, never below', () => {
    for (const name of ['idle', 'run']) {
      const animation = SPRITES.animations[name];
      const sheet = sheetOf(animation);

      for (const row of drawnRows(animation.rows)) {
        const soles = Array.from({ length: animation.frames }, (_, column) =>
          Math.max(...cellRows(sheet, { column, row })),
        );

        expect(Math.max(...soles), `${name} row ${row}`).toBe(SPRITES.anchor.y - 1);
      }
    }
  });

  it('paints every shade of the kit, and nothing but the kit and the fixed shades', () => {
    const colours = opaqueColours();
    const kit = Object.values(SPRITE_KIT).flat();

    for (const hex of kit) {
      expect(colours.has(hex), hex).toBe(true);
    }

    expect([...colours].filter((hex) => !kit.includes(hex) && !FIXED.includes(hex))).toEqual([]);
  });

  it('keeps the parts apart: no shade is in two ramps, or a fixed one', () => {
    const shades = [...Object.values(SPRITE_KIT).flat(), ...FIXED];

    expect(new Set(shades).size).toBe(shades.length);
  });

  it('leaves no near-shirt colour outside the shirt ramp, so a kit recolours every shirt pixel', () => {
    const shirt = SPRITE_KIT.shirt.map(rgbOf);
    const strays = [...opaqueColours()].filter(
      (hex) =>
        !SPRITE_KIT.shirt.includes(hex) &&
        shirt.some((shade) => distance(shade, rgbOf(hex)) < NEAR_SHIRT),
    );

    expect(strays).toEqual([]);
  });
});
