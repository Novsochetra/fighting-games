import { describe, expect, it } from 'vitest';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: the bosses and their effects were shrunk paintings, not pixel art: a boss sheet held some
// 250 colors and an effect hundreds or thousands, in smooth gradients, and in most of their
// frames over half the pixels matched none of their neighbours, so beside the raiders they looked
// smeared. Each is now drawn in a small palette of flat clusters with hard edges
const GAME = new URL('../../../', import.meta.url);
const BOSS_EFFECTS = {
  khan: ['crescent', 'glint'],
  colossus: ['boulder', 'shards', 'spike'],
  ironhorn: ['impact', 'bamboo', 'stars'],
  cobra: ['glob', 'puddle', 'hypnosis'],
  queen: ['wasp', 'eruption'],
  gnoll: ['howl', 'bones', 'redeye'],
  djinn: ['zap', 'tornado', 'thunder'],
  furnace: ['blaze', 'slag', 'lava', 'beam', 'flare', 'steam'],
  pharaoh: ['scarab', 'canopic', 'curse', 'sunfall', 'mirageBolt'],
  ox: ['hook', 'chain', 'parry', 'axeWhirl'],
  guardian: ['gazePillar', 'figRoot', 'rockBurst', 'stoneFace'],
  naga: ['tide', 'splash', 'serpentRise', 'spiritNaga', 'rainbowOrb', 'nagaBolt'],
};
const MOST_SHEET_COLORS = 100;
const MOST_EFFECT_COLORS = 32;
// the share of a frame's pixels that match none of their four neighbours; the raiders' is 0.2,
// and an effect's sparks and thin streaks raise it
const MOST_SHEET_SPECKLE = 0.3;
const MOST_EFFECT_SPECKLE = 0.5;
const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const enemySheet = (kind) =>
  readPngAlpha(new URL(`assets/sprites/enemies/${ENEMY_SPRITES[kind].file}`, GAME));
const effectStrip = (name) => readPngAlpha(new URL(`assets/sprites/fx/${name}.png`, GAME));

function palette(image) {
  const colors = new Set();
  let soft = 0;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const alpha = image.alpha(x, y);
      soft += alpha > 0 && alpha < 255 ? 1 : 0;
      if (alpha > 0) {
        colors.add(image.colorKey(x, y));
      }
    }
  }
  return { colors: colors.size, soft };
}

const drawnAt = (image, box, x, y) =>
  x >= 0 && y >= 0 && x < box.width && y < box.height && image.alpha(box.left + x, box.top + y) > 0;

function isLone(image, box, x, y) {
  const key = image.colorKey(box.left + x, box.top + y);
  return NEIGHBOURS.every(
    ([dx, dy]) =>
      !drawnAt(image, box, x + dx, y + dy) ||
      image.colorKey(box.left + x + dx, box.top + y + dy) !== key,
  );
}

// the share of a frame's drawn pixels that match none of their neighbours
function speckle(image, box) {
  let drawn = 0;
  let lone = 0;
  for (let y = 0; y < box.height; y++) {
    for (let x = 0; x < box.width; x++) {
      if (drawnAt(image, box, x, y)) {
        drawn++;
        lone += isLone(image, box, x, y) ? 1 : 0;
      }
    }
  }
  return drawn > 30 ? lone / drawn : 0;
}

function sheetBoxes(kind) {
  const { frameWidth: width, frameHeight: height, strips } = ENEMY_SPRITES[kind];
  return Object.values(strips).flatMap(({ row, frames }) =>
    Array.from({ length: frames }, (_, frame) => ({
      left: frame * width,
      top: row * height,
      width,
      height,
    })),
  );
}

function effectBoxes(name) {
  const { frameWidth: width, frameHeight: height, frames } = FX_SPRITES[name];
  return Array.from({ length: frames }, (_, frame) => ({
    left: frame * width,
    top: 0,
    width,
    height,
  }));
}

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

describe('the bosses and their effects as pixel art', () => {
  for (const [kind, effects] of Object.entries(BOSS_EFFECTS)) {
    it(`draws the ${kind} in a small palette of flat, hard-edged pixels`, () => {
      const sheet = enemySheet(kind);
      const { colors, soft } = palette(sheet);
      expect(colors).toBeLessThanOrEqual(MOST_SHEET_COLORS);
      expect(soft).toBe(0);
      const spread = average(sheetBoxes(kind).map((box) => speckle(sheet, box)));
      expect(spread).toBeLessThanOrEqual(MOST_SHEET_SPECKLE);
    });

    it(`draws the ${kind}'s effects the same way`, () => {
      for (const name of effects) {
        const strip = effectStrip(name);
        const { colors, soft } = palette(strip);
        expect(colors, name).toBeLessThanOrEqual(MOST_EFFECT_COLORS);
        expect(soft, name).toBe(0);
        const spread = average(effectBoxes(name).map((box) => speckle(strip, box)));
        expect(spread, name).toBeLessThanOrEqual(MOST_EFFECT_SPECKLE);
      }
    });
  }
});
