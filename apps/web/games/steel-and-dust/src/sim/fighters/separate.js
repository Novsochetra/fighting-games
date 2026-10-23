import { isOutOfReach } from '../combat/boxes.js';
import { nudge, onOneLevel } from './terrain-motion.js';

const SOLID_STATES = new Set(['idle', 'walk', 'run', 'attack', 'hurt', 'charge', 'squat']);

function isSolid(fighter) {
  return (
    !fighter.airborne &&
    !fighter.entering &&
    SOLID_STATES.has(fighter.state) &&
    !isOutOfReach(fighter)
  );
}

function randomSide() {
  return Math.random() < 0.5 ? -1 : 1;
}

// a boss keeps others off most of its body, so nobody stands inside its art; the rest of it may
// overlap, as bodies do in a brawl
const BOSS_BODY_KEPT = 0.75;

function halfBody(fighter, apart) {
  const shape = fighter.def?.boss && fighter.def.hurtShape;
  return shape ? (shape[2] / 2) * BOSS_BODY_KEPT * fighter.scale : apart * fighter.scale;
}

function pushApart(terrain, first, second) {
  const apart = first.side === second.side ? 5 : 7;
  const minimum = halfBody(first, apart) + halfBody(second, apart);
  const dx = second.x - first.x;
  if (Math.abs(dx) >= minimum) {
    return;
  }
  const push = Math.min(1.2, (minimum - Math.abs(dx)) / 2);
  const side = dx === 0 ? randomSide() : Math.sign(dx);
  nudge(terrain, first, -push * side);
  nudge(terrain, second, push * side);
}

export function separateFighters(fighters, terrain) {
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const first = fighters[i];
      const second = fighters[j];
      // a raider down on the road does not shove the hero standing on the bank above it
      if (isSolid(first) && isSolid(second) && onOneLevel(terrain, first, second)) {
        pushApart(terrain, first, second);
      }
    }
  }
}
