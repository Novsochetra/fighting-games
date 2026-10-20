import { FX_COLORS } from '../../../art/fx-colors.js';
import { clamp } from '../../../lib/math.js';
import { arenaBounds } from '../../fighters/arena-bounds.js';
import { floorUnder, placeOnGround } from '../../fighters/terrain-motion.js';
import { addDust, addSparks } from '../../fx/particles.js';

const BLINK_COOLDOWN = 150;
const AMBUSH_GAP = 26;
const ESCAPE_GAP = 110;

function sandPuff(game, fighter) {
  const color = FX_COLORS.mirage;
  addSparks(game, { x: fighter.x, y: fighter.y - 16, count: 10, color, speed: 2.2 });
  const y = floorUnder(game.terrain, fighter);
  addDust(game, { x: fighter.x, y, count: 5, color: FX_COLORS.mirageDust });
}

// casters slip away from a hero who closes in; assassins reappear behind the hero instead
function landingX(game, fighter) {
  const player = game.player;
  const toPlayer = Math.sign(player.x - fighter.x) || 1;
  if (!fighter.def.ranged) {
    return player.x + toPlayer * AMBUSH_GAP;
  }
  const bounds = arenaBounds(game, fighter);
  const roomRight = bounds.max - player.x > player.x - bounds.min;
  return player.x + (roomRight ? 1 : -1) * ESCAPE_GAP;
}

export function tryBlink(game, fighter, distance) {
  const ai = fighter.ai;
  if (ai.blinkCooldown > 0) {
    ai.blinkCooldown--;
    return false;
  }
  if (!fighter.def.blink || distance > 40 || Math.random() > 0.05) {
    return false;
  }
  const bounds = arenaBounds(game, fighter);
  sandPuff(game, fighter);
  fighter.x = clamp(landingX(game, fighter), bounds.min, bounds.max);
  placeOnGround(game.terrain, fighter);
  fighter.facing = game.player.x >= fighter.x ? 1 : -1;
  fighter.vx = 0;
  sandPuff(game, fighter);
  ai.blinkCooldown = BLINK_COOLDOWN;
  game.io.sfx('warp', false, { vol: 0.6, x: fighter.x });
  return true;
}
