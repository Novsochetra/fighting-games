import { describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';
import { portraitRow } from '../../../src/render/overlays/ult-cut-in.js';

describe("the ultimate cut-in's portrait", () => {
  it('shows Bokator bare-handed, as he fights his ultimate', () => {
    expect(portraitRow('bokator')).toBe(WEAPONS.fists.spriteRow);
  });

  it('shows every other hero with the sword', () => {
    for (const hero of HEROES.filter(({ id }) => id !== 'bokator')) {
      expect(portraitRow(hero.id), hero.id).toBe(WEAPONS.sword.spriteRow);
    }
  });
});
