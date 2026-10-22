import { FX_COLORS } from '../../../art/fx-colors.js';
import { clamp } from '../../../lib/math.js';
import { arenaBounds } from '../../fighters/arena-bounds.js';
import { bodySize } from '../../fighters/body-point.js';
import { floorUnder, placeOnGround } from '../../fighters/terrain-motion.js';
import { addDust, addSparks } from '../../fx/particles.js';
import { addBurst } from '../../summons/bursts.js';

const BLINK_COOLDOWN = 150;
const AMBUSH_GAP = 26;
const ESCAPE_GAP = 110;
const SLIP_COOLDOWN = 240;
const SLIP_CHANCE = 0.08;
// the whirl he leaves in is a dust devil his own size (body-point.js)
const WHIRL_SIZE = 0.5;

function sandPuff(game, fighter) {
  const color = FX_COLORS.mirage;
  addSparks(game, { x: fighter.x, y: fighter.y - 16, count: 10, color, speed: 2.2 });
  const y = floorUnder(game.terrain, fighter);
  addDust(game, { x: fighter.x, y, count: 5, color: FX_COLORS.mirageDust });
}

// a djinn leaves in a whirl of sand, the dust devil he is, in small
function whirl(game, fighter) {
  const y = floorUnder(game.terrain, fighter);
  addBurst(game, { sprite: 'tornado', x: fighter.x, y, scale: bodySize(fighter, WHIRL_SIZE) });
  addDust(game, { x: fighter.x, y, count: 8, color: FX_COLORS.mirageDust });
}

function escapeX(game, fighter) {
  const player = game.player;
  const bounds = arenaBounds(game, fighter);
  const roomRight = bounds.max - player.x > player.x - bounds.min;
  return player.x + (roomRight ? 1 : -1) * ESCAPE_GAP;
}

// casters slip away from a hero who closes in; assassins reappear behind the hero instead
function landingX(game, fighter) {
  const player = game.player;
  const toPlayer = Math.sign(player.x - fighter.x) || 1;
  return fighter.def.ranged ? escapeX(game, fighter) : player.x + toPlayer * AMBUSH_GAP;
}

function blinkTo(game, fighter, { x, puff }) {
  const bounds = arenaBounds(game, fighter);
  puff(game, fighter);
  fighter.x = clamp(x, bounds.min, bounds.max);
  placeOnGround(game.terrain, fighter);
  fighter.facing = game.player.x >= fighter.x ? 1 : -1;
  fighter.vx = 0;
  puff(game, fighter);
  game.io.sfx('warp', false, { vol: 0.6, x: fighter.x });
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
  blinkTo(game, fighter, { x: landingX(game, fighter), puff: sandPuff });
  ai.blinkCooldown = BLINK_COOLDOWN;
  return true;
}

// a floating boss the hero crowds is gone in a whirl of sand, back where there is room to fight
export function slipAway(game, boss) {
  const ai = boss.ai;
  if (game.tickCount < (ai.slipReadyAt ?? 0) || Math.random() > SLIP_CHANCE) {
    return false;
  }
  blinkTo(game, boss, { x: escapeX(game, boss), puff: whirl });
  ai.slipReadyAt = game.tickCount + SLIP_COOLDOWN;
  return true;
}
