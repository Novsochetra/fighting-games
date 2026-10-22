import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { hazardAttacker } from './hazard-attacker.js';
import { SHOT_RULES } from './shot-rules.js';

// a ground hazard only burns feet on the ground
function canReach(shot, rules, target) {
  return (
    target.side !== shot.side &&
    !shot.hitTargets.has(target) &&
    !(rules.groundOnly && target.airborne)
  );
}

// everything on the other side inside the area takes the hit once
export function hitArea(game, { shot, area, hit }) {
  const rules = SHOT_RULES[shot.kind];
  const attacker = hazardAttacker(shot, shot.side === 'player' ? 'sword' : rules.enemyWeapon);
  const move = { damage: shot.damage, ...hit };
  for (const target of game.fighters) {
    if (!canReach(shot, rules, target)) {
      continue;
    }
    const body = hurtBox(target);
    if (
      body &&
      overlaps(area, body) &&
      applyHit(game, { attacker, target, move, x: shot.x, y: shot.y })
    ) {
      shot.hitTargets.add(target);
      shot.dead = shot.dead || Boolean(rules.breaksOnHit);
    }
  }
}
