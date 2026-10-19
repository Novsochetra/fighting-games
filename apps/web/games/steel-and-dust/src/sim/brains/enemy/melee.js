import { startMove } from '../../fighters/actions.js';
import { standStill, walk } from './movement.js';

function basicAttack(fighter) {
  return fighter.def.attackMove || (fighter.def.weapon === 'knife' ? 'stab' : 'punch');
}

function tryAttack(game, fighter, distance) {
  const def = fighter.def;
  if (distance <= def.range + 4) {
    startMove(game, fighter, basicAttack(fighter));
    return true;
  }
  if (def.lunge && distance > 40 && distance < 72 && Math.random() < 0.04) {
    startMove(game, fighter, 'lunge');
    return true;
  }
  return false;
}

// a raider holding an attack token closes in; the rest circle at their own distance
export function thinkMelee(game, fighter, { distance, playerDown }) {
  const ready =
    fighter.hasToken && fighter.ai.cooldown <= 0 && !playerDown && !game.player.airborne;
  if (ready && tryAttack(game, fighter, distance)) {
    return;
  }
  const wanted = fighter.hasToken ? fighter.def.range - 4 : fighter.ai.spacing;
  if (distance > wanted + 6) {
    walk(fighter, 1, 1);
  } else if (distance < wanted - 6) {
    walk(fighter, -1, 0.7);
  } else {
    standStill(fighter);
    if (Math.random() < 0.01) {
      fighter.ai.spacing = 40 + Math.random() * 44;
    }
  }
}
