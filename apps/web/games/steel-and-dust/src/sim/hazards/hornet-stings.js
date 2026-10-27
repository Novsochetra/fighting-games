import { STING, SWARM } from '../../data/nests.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { hazardAttacker } from './hazard-attacker.js';

// a sting only flinches a body on its feet: one in the air would be kept aloft by it, and one
// down is out of reach until it gets up
const OFF_ITS_FEET = new Set(['juggle', 'down', 'getup', 'ko']);
const HORNET_SIZE = 8;

// raiders still walking in from off screen are not in the fight yet, and the knocked out are done
export function canBeChased(fighter) {
  return !fighter.entering && !fighter.removed && fighter.state !== 'ko';
}

export function canBeStung(fighter) {
  return canBeChased(fighter) && !fighter.airborne && !OFF_ITS_FEET.has(fighter.state);
}

function hornetBox(hornet) {
  const half = HORNET_SIZE / 2;

  return { x: hornet.x - half, y: hornet.y - half, width: HORNET_SIZE, height: HORNET_SIZE };
}

// a raider stung is the hero's hit, so it scores and builds the combo; the hero stung is hurt as
// by a raider's
function sting(game, hornet, target) {
  const hero = target.side === 'player';
  const direction = target.x >= hornet.x ? 1 : -1;
  const attacker = hazardAttacker(
    { x: hornet.x, direction, side: hero ? 'enemy' : 'player' },
    hero ? 'knife' : 'spear',
  );
  const move = hero ? STING.hero : STING.raider;

  applyHit(game, { attacker, target, move, x: hornet.x, y: hornet.y });
}

// the first hornet of the swarm to touch the body it chases stings it, then the swarm waits
export function stingTarget(game, swarm, hornet) {
  const { target } = swarm;
  const body = target && swarm.cooldown === 0 && canBeStung(target) && hurtBox(target);

  if (!body || !overlaps(hornetBox(hornet), body)) {
    return;
  }

  sting(game, hornet, target);
  swarm.cooldown = target.side === 'player' ? SWARM.heroEvery : SWARM.raiderEvery;
}
