import { describe, expect, it } from 'vitest';
import { HERO_THEMES } from '../../../src/art/hero-themes.js';
import { WEAPON_COLORS } from '../../../src/art/weapon-colors.js';
import { DEFAULT_HERO, HEROES, heroById } from '../../../src/data/heroes.js';
import { defaultSettings } from '../../../src/data/settings.js';

describe('the Shades', () => {
  it('offers four heroes, each with its own sprite folder and colors', () => {
    expect(HEROES.map((hero) => hero.id)).toEqual(['moss', 'firefly', 'antler', 'blue']);
    expect(new Set(HEROES.map((hero) => hero.directory)).size).toBe(4);
    for (const hero of HEROES) {
      expect(HERO_THEMES[hero.id], hero.id).toBeDefined();
    }
  });

  it('starts as the Moss Shade, whose sword keeps its original colors', () => {
    expect(defaultSettings(false).hero).toBe(DEFAULT_HERO);
    expect(HERO_THEMES.moss.blade).toBe(WEAPON_COLORS.sword.trail);
    expect(HERO_THEMES.moss.spark).toBe(WEAPON_COLORS.sword.spark);
  });

  it('falls back to the first hero for an unknown saved id', () => {
    expect(heroById('firefly').name).toBe('Firefly Shade');
    expect(heroById('nobody').id).toBe('moss');
  });
});
