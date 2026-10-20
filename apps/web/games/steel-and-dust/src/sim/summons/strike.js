import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { hazardAttacker } from '../hazards/hazard-attacker.js';

// summons strike through a stand-in attacker holding the Shade's sword, so sparks take its glow
export function strikeTarget(game, summon, { target, move }) {
  const body = hurtBox(target);
  if (!body) {
    return false;
  }
  const attacker = hazardAttacker(summon, 'sword');
  const y = body.y + body.height / 2;
  return applyHit(game, { attacker, target, move: move || summon.hit, x: target.x, y });
}

// every raider inside the area that this summon has not struck yet takes its hit
export function strikeArea(game, summon, area) {
  const struck = [];
  for (const target of game.fighters) {
    if (target.side === summon.side || summon.hitTargets.has(target)) {
      continue;
    }
    const body = hurtBox(target);
    if (body && overlaps(area, body) && strikeTarget(game, summon, { target })) {
      summon.hitTargets.add(target);
      struck.push(target);
    }
  }
  return struck;
}
