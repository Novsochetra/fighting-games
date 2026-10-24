import { ultDamageToBoss } from '../../data/boss-toughness.js';
import { difficultyOf } from '../../data/difficulty.js';
import { isPlayer } from '../fighters/loadout.js';

function enemyDamage(target, move) {
  const damage = move.damage * (target.move?.exposed ? 2 : 1);
  return move.ultimate && target.def.boss ? ultDamageToBoss(damage) : damage;
}

export function damageOf(game, target, move) {
  return isPlayer(target)
    ? Math.max(1, Math.round(move.damage * difficultyOf(game.settings).damage))
    : enemyDamage(target, move);
}
