import { isPlayer } from '../fighters/loadout.js';
import { attackerWeapon } from './hit-feedback.js';

const ENEMY_HIT_SOUND = { hammer: 'heavy', knife: 'blade' };

// every blow on the hero's side while the ultimate runs, the hero's and its summons', bursts the
// same way whatever the weapon
function hitSoundKey(game, attacker) {
  if (isPlayer(attacker) && game.player?.state === 'ult') {
    return 'ultHit';
  }
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
  game.io.sfx(hitSoundKey(game, hit.attacker), hitstop >= 9, {
    x: hit.x,
    rate: hitPitch(game, hit.attacker),
  });
}

// an ultimate's own blow bursts as it is thrown, whether or not anything is there to take it; a blow
// that lands plays the same burst at the same moment, which the sound bank merges into one
export function playUltStrike(game, move, x) {
  game.io.sfx('ultHit', move.hitstop >= 9, { x });
}
