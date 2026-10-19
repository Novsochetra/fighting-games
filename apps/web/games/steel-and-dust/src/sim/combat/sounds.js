import { SWING_LEAD_SECONDS } from '../../data/swing-leads.js';
import { isPlayer } from '../fighters/loadout.js';

const ENEMY_SWING = { knife: 'Sword', hammer: 'Axe' };
const PLAYER_SWING = { fists: 'Fists', sword: 'Sword', spear: 'Spear', axe: 'Axe' };

function isBigSwing(move) {
  return move.damage >= 12 || move.chargeLevel || move.launch;
}

export function swingKey(fighter, move) {
  const weapon = isPlayer(fighter)
    ? PLAYER_SWING[fighter.weapon.id]
    : (ENEMY_SWING[fighter.weapon.id] ?? 'Fists');
  return `swing${weapon}${isBigSwing(move) ? 'Big' : ''}`;
}

export function playSwing(game, fighter, move) {
  game.io.sfx(swingKey(fighter, move), false, {
    vol: isPlayer(fighter) ? 1 : 0.55,
    x: fighter.x,
    dir: fighter.facing,
  });
}

export function swingLeadTicks(fighter, move) {
  return Math.round(SWING_LEAD_SECONDS[swingKey(fighter, move)] * 60);
}

function shoutGap(fighter, kind) {
  if (fighter.def.boss) {
    return 45;
  }
  return kind === 'big' ? 14 : 30;
}

// not every hit of a fast string gets a voice, or a combo turns into noise
function staysQuiet(game, fighter, kind) {
  if (game.tickCount - fighter.lastShoutAt < shoutGap(fighter, kind)) {
    return true;
  }
  return kind !== 'big' && Math.random() < 0.45;
}

function voiceKey(boss, dying) {
  if (boss) {
    return dying ? 'voiceBossKo' : 'voiceBoss';
  }
  return dying ? 'voiceDie' : 'voiceHurt';
}

export function shout(game, fighter, kind) {
  const dying = kind === 'die';
  if (!dying && staysQuiet(game, fighter, kind)) {
    return;
  }
  fighter.lastShoutAt = game.tickCount;
  game.io.sfx(voiceKey(fighter.def.boss, dying), false, {
    rate: fighter.def.voicePitch || 1,
    x: fighter.x,
  });
}
