import { FX_COLORS } from '../../art/fx-colors.js';
import { fxLength } from '../../data/fx-sprites.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';
import { groundAt } from '../stage/terrain.js';

const SWEEP_SPEED = 4.6;
const SWEEP_DAMAGE = 14;
// a spirit waits just past the screen's edge while its lane along the floor is marked
export const SWEEP_WARN = 40;
// its head, where the strip is held, rides this high over the floor, so its body skims the stone
export const SPIRIT_HEAD_UP = 31;
const RISE = { warn: 50, half: 21, damage: 16 };
const TRAIL_EVERY = 2;

// a spirit naga of the rainbow sweeps the floor: a near one from behind her, a far one from behind
// the hero
export function sendSpirit(game, boss, from) {
  const { left, right } = screenEdges(game);
  const direction = from === 'near' ? boss.facing : -boss.facing;
  const x = direction > 0 ? left - 30 : right + 30;
  game.projectiles.push({
    kind: 'spiritNaga',
    x,
    y: groundAt(game.terrain, x),
    direction,
    speed: 0,
    side: boss.side,
    time: 0,
    damage: SWEEP_DAMAGE,
    hitTargets: new Set(),
  });
  game.io.sfx('rainbow', false, { x, dir: direction });
}

// it trails the colors of the rainbow behind its head as it sweeps
export function sweepSpirit(game, spirit) {
  spirit.speed = spirit.time >= SWEEP_WARN ? SWEEP_SPEED : 0;
  spirit.y = groundAt(game.terrain, spirit.x);
  if (spirit.time >= SWEEP_WARN && spirit.time % TRAIL_EVERY === 0) {
    const colors = FX_COLORS.rainbow;
    addSparks(game, {
      x: spirit.x - spirit.direction * 27,
      y: spirit.y - SPIRIT_HEAD_UP + ((spirit.time >> 1) % 5) * 4,
      count: 1,
      color: colors[(spirit.time >> 1) % colors.length],
      speed: 0.8,
    });
  }
}

export const isSweeping = (spirit) => spirit.time >= SWEEP_WARN;

// the spot under the hero is marked; `warn` ticks later a serpent of water bursts up out of it
export function markSerpent(game, boss) {
  const x = game.player.x;
  game.projectiles.push({
    kind: 'serpentRise',
    x,
    y: groundAt(game.terrain, x),
    direction: boss.facing,
    speed: 0,
    side: boss.side,
    time: 0,
    ...RISE,
    hitTargets: new Set(),
  });
}

// it bites only while it stands tall, frames 2 to 5 of its strip
export const isRising = (rise) => rise.time >= rise.warn + 8 && rise.time < rise.warn + 24;

// the water bubbles over the spot while it gathers, then bursts up and shakes the arena
export function burstSerpent(game, rise) {
  if (rise.time < rise.warn && rise.time % 4 === 0) {
    const x = rise.x + (((rise.time >> 2) % 5) - 2) * 5;
    addSparks(game, { x, y: rise.y - 2, count: 1, color: FX_COLORS.foam, speed: 1 });
  }
  if (rise.time === rise.warn) {
    shake(game, 6, 20);
    addBurst(game, { sprite: 'splash', x: rise.x, y: rise.y, scale: 1.4, behind: true });
    game.io.sfx('splash', false, { vol: 1, x: rise.x });
  }
  rise.dead = rise.time >= rise.warn + fxLength('serpentRise');
}
