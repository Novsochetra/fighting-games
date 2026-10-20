import { heroById } from '../heroes.js';
import { WEAPONS } from '../weapons/index.js';
import { ANTLER_STYLE } from './antler.js';
import { applyStyle } from './apply-style.js';
import { BLUE_STYLE } from './blue.js';
import { FIREFLY_STYLE } from './firefly.js';
import { MOSS_STYLE } from './moss.js';

export const STYLES = {
  moss: MOSS_STYLE,
  firefly: FIREFLY_STYLE,
  antler: ANTLER_STYLE,
  blue: BLUE_STYLE,
};

// every Shade's take on every weapon, built once: STYLED_MOVES[heroId][weaponId][moveId]
const STYLED_MOVES = Object.fromEntries(
  Object.entries(STYLES).map(([heroId, style]) => [
    heroId,
    Object.fromEntries(
      Object.entries(WEAPONS).map(([weaponId, weapon]) => [
        weaponId,
        applyStyle(weapon.moves, style),
      ]),
    ),
  ]),
);

export function styleOf(heroId) {
  return STYLES[heroById(heroId).id];
}

export function heroMoves(heroId, weaponId) {
  return STYLED_MOVES[heroById(heroId).id][weaponId];
}
