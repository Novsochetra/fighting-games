import { describe, expect, it } from 'vitest';
import { HERO_SPRITES, stripsOf } from '../../../src/data/hero-sprites.js';
import { HEROES, heroById } from '../../../src/data/heroes.js';

describe("the strips a hero's sheet loads", () => {
  it('loads every strip, the ultimate too, for a hero with an ultimate strip', () => {
    for (const hero of HEROES.filter(({ ultStrip }) => ultStrip)) {
      expect(stripsOf(hero), hero.id).toEqual(Object.keys(HERO_SPRITES.frames));
    }
  });

  it('loads no ultimate strip for Bokator, who fights his bare-handed from his other strips', () => {
    const strips = stripsOf(heroById('bokator'));
    expect(strips).not.toContain('ult');
    expect(strips).toHaveLength(Object.keys(HERO_SPRITES.frames).length - 1);
  });
});
