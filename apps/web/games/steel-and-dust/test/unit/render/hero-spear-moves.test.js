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
const { frameWidth, frameHeight } = HERO_SPRITES;
const ember = HEROES.find((hero) => hero.id === 'ember');
const ownSpear = new URL('assets/sprites/heroes/ember/spear/', GAME);

function differingPixels(own, arsenal) {
  let count = 0;
  for (let y = 0; y < frameHeight; y++) {
    for (let x = 0; x < own.width; x++) {
      const inRow = arsenal.alpha(x, WEAPONS.spear.spriteRow * frameHeight + y);
      count += Boolean(own.alpha(x, y)) !== Boolean(inRow) ? 1 : 0;
    }
  }
  return count;
}

describe("the Ember Shade's own spear moves", () => {
  it('has one for every attack strip, a single row as long as the sword strip', () => {
    const files = readdirSync(ownSpear).filter((name) => name.endsWith('.png'));
    expect(files.map((name) => name.slice('hero_'.length, -'.png'.length)).sort()).toEqual(
      ATTACK_STRIPS,
    );
    for (const strip of ATTACK_STRIPS) {
      const own = readPngAlpha(new URL(`hero_${strip}.png`, ownSpear));
      expect([own.width, own.height], strip).toEqual([
        HERO_SPRITES.frames[strip] * frameWidth,
        frameHeight,
      ]);
    }
  });

  it('fills the spear row of its arsenal frame for frame', () => {
    for (const strip of ATTACK_STRIPS) {
      const own = readPngAlpha(new URL(`hero_${strip}.png`, ownSpear));
      const arsenal = readPngAlpha(new URL(`${ember.directory}hero_${strip}.png`, GAME));
      expect(differingPixels(own, arsenal), strip).toBe(0);
    }
  });

  it('belongs to the Ember Shade alone', () => {
    const others = HEROES.filter((hero) => hero !== ember);
    expect(others.map((hero) => existsSync(new URL(`${hero.directory}../spear/`, GAME)))).toEqual(
      others.map(() => false),
    );
  });
});
