import { startMove } from '../../fighters/actions.js';
import { onOneLevel } from '../../fighters/terrain-motion.js';
import { ledgeBehind } from './climb.js';
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
    startMove(game, fighter, def.lungeMove || 'lunge');
    return true;
  }
  return false;
}

// a swing at a hero on a bank or a platform above, or on the road below, cannot land
function isReady(game, fighter, playerDown) {
  const { player } = game;
  return (
    fighter.hasToken &&
    fighter.ai.cooldown <= 0 &&
    !playerDown &&
    !player.airborne &&
    onOneLevel(game.terrain, fighter, player)
  );
}

// a raider holding an attack token closes in; the rest circle at their own distance
export function thinkMelee(game, fighter, { distance, playerDown }) {
  if (isReady(game, fighter, playerDown) && tryAttack(game, fighter, distance)) {
    return;
  }
  const wanted = fighter.hasToken ? fighter.def.range - 4 : fighter.ai.spacing;
  if (distance > wanted + 6) {
    walk(fighter, 1, 1);
  } else if (distance < wanted - 6 && !ledgeBehind(game.terrain, fighter)) {
    walk(fighter, -1, 0.7);
  } else {
    standStill(fighter);
    if (Math.random() < 0.01) {
      fighter.ai.spacing = 40 + Math.random() * 44;
    }
  }
}
