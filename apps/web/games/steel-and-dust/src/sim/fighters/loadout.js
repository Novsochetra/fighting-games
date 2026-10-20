import { ENEMY_MOVES } from '../../data/enemies/enemy-moves.js';
import { heroMoves } from '../../data/styles/index.js';
import { WEAPONS } from '../../data/weapons/index.js';

export function isPlayer(fighter) {
  return fighter.side === 'player';
}

// the hero fights with the chosen Shade's take on the weapon in hand
export function movesetOf(game, fighter) {
  return isPlayer(fighter) ? heroMoves(game.settings.hero, fighter.weapon.id) : ENEMY_MOVES;
}

export function guardOf(fighter) {
  return isPlayer(fighter) ? WEAPONS[fighter.weapon.id].guardPose : fighter.def.guardPose || {};
}

export function setWeapon(game, fighter, id) {
  fighter.weapon = { id, durability: WEAPONS[id].durability };
  if (isPlayer(fighter)) {
    game.durabilityWarned = false;
  }
}
