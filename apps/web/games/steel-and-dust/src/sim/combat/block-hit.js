import { COLORS } from '../../art/colors.js';
import { isParrying, parryHit } from '../bosses/guard-counter.js';
import { isPlayer } from '../fighters/loadout.js';
import { addImpact } from '../fx/effects.js';
import { addSparks } from '../fx/particles.js';
import { showHint } from '../hints.js';

// whether the blow connected: a block does, so the striker's follow-up plays; the hero's parried
// blow does not, the hero already reeling (guard-counter.js), but a parried shot or summon is
// spent on the guard as on a block, or it would strike him again from behind as it passes
export function blockHit(game, hit) {
  const { attacker, target } = hit;
  if (isParrying(target)) {
    parryHit(game, hit);
    return attacker !== game.player;
  }
  const x = target.x + target.facing * 9 * target.scale;
  const y = target.y - 20 * target.scale;
  target.blockFlash = 10;
  target.vx = -target.facing * 0.9;
  attacker.hitstop = Math.max(attacker.hitstop || 0, 3);
  target.hitstop = 3;
  addSparks(game, { x, y, count: 7, color: COLORS.ice, speed: 2.4 });
  addImpact(game, {
    x,
    y,
    big: false,
    color: COLORS.ice,
    bladed: false,
    direction: -target.facing,
  });
  game.io.sfx('armor', false, { x });
  if (isPlayer(attacker) && attacker.state === 'attack') {
    attacker.hitConfirmed = true;
    if (!attacker.airborne) {
      attacker.vx = -attacker.facing * 1.3;
    }
  }
  game.floaters.push({ x, y: y - 8, text: 'block', color: COLORS.ice, time: 0 });
  showHint(game, 'shield');
  return true;
}
