import { FX_COLORS } from '../../art/fx-colors.js';
import { clamp } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { floorBelow } from '../stage/terrain.js';

const GRAVITY = 0.18;
const LIFT = -4.2;
const POT_DAMAGE = 12;
const POOL_DAMAGE = 5;
const POOL_LIFE = 300;
// the pot leaves his hands raised over his head, in sheet pixels from his feet halved and scaled
const HANDS = { ahead: 8, up: 50 };

function landingTime(drop) {
  return (-LIFT + Math.sqrt(LIFT * LIFT + 2 * GRAVITY * Math.max(0, drop))) / GRAVITY;
}

// the pot is aimed at the spot the hero stands on, marked there from the moment it leaves him
export function lobSlagPot(game, boss) {
  const x = boss.x + boss.facing * HANDS.ahead * boss.scale;
  const y = boss.y - HANDS.up * boss.scale;
  const distance = Math.max(30, (game.player.x - x) * boss.facing);
  const target = x + boss.facing * distance;
  const landing = { x: target, floor: floorBelow(game.terrain, target, y) };
  game.projectiles.push({
    kind: 'slagPot',
    x,
    y,
    vy: LIFT,
    direction: boss.facing,
    speed: clamp(distance / landingTime(landing.floor - y), 0.5, 5),
    side: boss.side,
    time: 0,
    damage: POT_DAMAGE,
    hitTargets: new Set(),
    floor: floorBelow(game.terrain, x, y),
    landing,
  });
  game.io.sfx('swingAxeBig', false, { x: boss.x, dir: boss.facing });
}

function breakPot(game, pot) {
  pot.dead = true;
  addSparks(game, { x: pot.x, y: pot.floor - 4, count: 12, color: FX_COLORS.slag, speed: 2.4 });
  shake(game, 3, 8);
  game.projectiles.push({
    kind: 'lavaPool',
    x: pot.x,
    y: pot.floor,
    direction: pot.direction,
    speed: 0,
    side: pot.side,
    time: 0,
    life: POOL_LIFE,
    damage: POOL_DAMAGE,
    hitTargets: new Set(),
  });
  game.io.sfx('sizzle', false, { x: pot.x });
}

// it arcs under its own weight and breaks into a pool of lava where it meets the ground, or on the
// floor under a hero it strikes on the way
export function flySlagPot(game, pot) {
  pot.y += pot.vy;
  pot.vy += GRAVITY;
  pot.floor = floorBelow(game.terrain, pot.x, Math.min(pot.y, pot.floor));
  if (pot.y >= pot.floor || pot.hitTargets.size > 0) {
    breakPot(game, pot);
  }
}

export function coolLava(_game, pool) {
  pool.dead = pool.time >= pool.life;
}
