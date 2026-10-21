import { HERO_THEMES } from '../../art/hero-themes.js';
import { heroById } from '../../data/heroes.js';
import { WEAPONS } from '../../data/weapons/index.js';

// the sword glows in the chosen Shade's color; the other weapons keep their own unless the
// Shade's theme claims them too
export function themeOf(game) {
  return HERO_THEMES[heroById(game.settings.hero).id];
}

export function weaponGlowOf(theme, weaponId) {
  if (weaponId === 'sword') {
    return { trail: theme.blade, spark: theme.spark };
  }
  const weapon = WEAPONS[weaponId];
  return theme.weapons?.[weaponId] || { trail: weapon.trailColor, spark: weapon.sparkColor };
}

export function trailColorOf(game, weaponId) {
  return weaponGlowOf(themeOf(game), weaponId).trail;
}

export function sparkColorOf(game, weaponId) {
  return weaponGlowOf(themeOf(game), weaponId).spark;
}
