import { HERO_THEMES } from '../../art/hero-themes.js';
import { heroById } from '../../data/heroes.js';
import { WEAPONS } from '../../data/weapons/index.js';

// the sword glows in the chosen Shade's color; the other weapons keep their own
export function themeOf(game) {
  return HERO_THEMES[heroById(game.settings.hero).id];
}

export function trailColorOf(game, weaponId) {
  return weaponId === 'sword' ? themeOf(game).blade : WEAPONS[weaponId].trailColor;
}

export function sparkColorOf(game, weaponId) {
  return weaponId === 'sword' ? themeOf(game).spark : WEAPONS[weaponId].sparkColor;
}
