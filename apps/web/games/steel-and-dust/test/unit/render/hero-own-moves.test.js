import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME = new URL('../../../', import.meta.url);
const ATTACK_STRIPS = [
  'air_rising_cut',
  'air_slash',
  'cleave',
  'meteor_slash',
  'plunge',
  'rising_dragon',
  'slash1',
  'slash2',
  'spin_slash',
  'thrust',
];
// [hero, weapon]: the heroes that fight with moves of their own for one weapon
const OWN_MOVES = [
  ['ember', 'spear'],
  ['bokator', 'fists'],
];
const { frameWidth, frameHeight } = HERO_SPRITES;
const heroOf = (id) => HEROES.find((hero) => hero.id === id);
const ownFolder = (hero, weapon) => new URL(`${hero.directory}../${weapon}/`, GAME);

function differingPixels(own, arsenal, row) {
  let count = 0;
  for (let y = 0; y < frameHeight; y++) {
    for (let x = 0; x < own.width; x++) {
      const inRow = arsenal.alpha(x, row * frameHeight + y);
      count += Boolean(own.alpha(x, y)) !== Boolean(inRow) ? 1 : 0;
    }
  }
  return count;
}

describe.each(OWN_MOVES)("the %s hero's own %s moves", (heroId, weapon) => {
  const hero = heroOf(heroId);
  const folder = ownFolder(hero, weapon);

  it('has one for every attack strip, a single row as long as the sword strip', () => {
    const files = readdirSync(folder).filter((name) => name.endsWith('.png'));
    expect(files.map((name) => name.slice('hero_'.length, -'.png'.length)).sort()).toEqual(
      ATTACK_STRIPS,
    );
    for (const strip of ATTACK_STRIPS) {
      const own = readPngAlpha(new URL(`hero_${strip}.png`, folder));
      expect([own.width, own.height], strip).toEqual([
        HERO_SPRITES.frames[strip] * frameWidth,
        frameHeight,
      ]);
    }
  });

  it("fills that weapon's row of its arsenal frame for frame", () => {
    for (const strip of ATTACK_STRIPS) {
      const own = readPngAlpha(new URL(`hero_${strip}.png`, folder));
      const arsenal = readPngAlpha(new URL(`${hero.directory}hero_${strip}.png`, GAME));
      expect(differingPixels(own, arsenal, WEAPONS[weapon].spriteRow), strip).toBe(0);
    }
  });

  it('belongs to that hero alone', () => {
    const others = HEROES.filter((other) => other !== hero);
    expect(others.map((other) => existsSync(ownFolder(other, weapon)))).toEqual(
      others.map(() => false),
    );
  });
});
