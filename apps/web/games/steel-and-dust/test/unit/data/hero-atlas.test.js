import { describe, expect, it } from 'vitest';
import { HERO_ATLAS } from '../../../src/data/hero-atlas/index.js';
import {
  HERO_SPRITES,
  packedStripPath,
  stripPath,
  stripsOf,
} from '../../../src/data/hero-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { packedMismatches } from '../../support/packed-sheets.js';

const GAME = new URL('../../../', import.meta.url);

function stripMismatches(hero, name) {
  const [frameHeight, ...rows] = HERO_ATLAS[hero.id][name];
  return packedMismatches({
    gridPath: new URL(stripPath(hero, name), GAME),
    packedPath: new URL(packedStripPath(hero, name), GAME),
    frameWidth: HERO_SPRITES.frameWidth,
    frameHeight,
    rows,
  });
}

describe("the Shades' packed strips", () => {
  it('have a table of pieces for every strip each Shade loads', () => {
    for (const hero of HEROES) {
      expect(Object.keys(HERO_ATLAS[hero.id]), hero.id).toEqual(stripsOf(hero));
    }
  });

  // a strip changed or baked again without running tools/pack_hero_strips.py fails here
  it('hold every frame of the grid strips pixel for pixel, with only empty space cut away', () => {
    for (const hero of HEROES) {
      for (const name of stripsOf(hero)) {
        expect(stripMismatches(hero, name), `${hero.id} ${name}`).toEqual([]);
      }
    }
  });
});
