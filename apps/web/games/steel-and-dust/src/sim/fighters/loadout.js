import { ENEMY_MOVES } from '../../data/enemies/enemy-moves.js';
import { WEAPONS } from '../../data/weapons/index.js';

export function isPlayer(fighter) {
  return fighter.side === 'player';
}

export function movesetOf(fighter) {
  return isPlayer(fighter) ? WEAPONS[fighter.weapon.id].moves : ENEMY_MOVES;
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
