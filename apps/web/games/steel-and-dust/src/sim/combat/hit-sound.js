import { isPlayer } from '../fighters/loadout.js';
import { attackerWeapon } from './hit-feedback.js';

const ENEMY_HIT_SOUND = { hammer: 'heavy', knife: 'blade' };

function hitSoundKey(attacker) {
  const weapon = attackerWeapon(attacker);
  if (weapon) {
    return weapon.hitSound;
  }
  return (attacker.weapon && ENEMY_HIT_SOUND[attacker.weapon.id]) || 'blunt';
}

// the hero's hits climb a little in pitch as the combo grows
function hitPitch(game, attacker) {
  return isPlayer(attacker) ? 1 + Math.min(game.combo.count, 20) * 0.004 : 1;
}

export function playHitSound(game, hit, hitstop) {
  game.io.sfx(hitSoundKey(hit.attacker), hitstop >= 9, {
    x: hit.x,
    rate: hitPitch(game, hit.attacker),
  });
}
