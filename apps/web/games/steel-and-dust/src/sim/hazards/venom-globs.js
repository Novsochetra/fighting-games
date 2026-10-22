import { FX_COLORS } from '../../art/fx-colors.js';
import { clamp } from '../../lib/math.js';
import { addSparks } from '../fx/particles.js';
import { floorBelow } from '../stage/terrain.js';

const GRAVITY = 0.16;
const GLOB_LIFT = -3;
const GLOB_DAMAGE = 7;
const PUDDLE_DAMAGE = 3;
const MOUTH = { ahead: 14, up: 33 };

function landingTime(drop) {
  return (
    (-GLOB_LIFT + Math.sqrt(GLOB_LIFT * GLOB_LIFT + 2 * GRAVITY * Math.max(0, drop))) / GRAVITY
  );
}

// the globs spread round the spot the hero stands on, so stepping aside from one walks into another
export function spitVenom(game, fighter, { count, gap, puddle }) {
  const x = fighter.x + fighter.facing * MOUTH.ahead;
  const y = fighter.y - MOUTH.up;
  const reach = (game.player.x - x) * fighter.facing;
  for (let i = 0; i < count; i++) {
    const distance = Math.max(20, reach + (i - (count - 1) / 2) * gap);
    const target = x + fighter.facing * distance;
    const landing = { x: target, floor: floorBelow(game.terrain, target, y) };
    const flight = landingTime(landing.floor - y);
    game.projectiles.push({
      kind: 'glob',
      x,
      y,
      vy: GLOB_LIFT,
      direction: fighter.facing,
      speed: clamp(distance / flight, 0.4, 4),
      side: fighter.side,
      time: 0,
      damage: GLOB_DAMAGE,
      hitTargets: new Set(),
      floor: floorBelow(game.terrain, x, y),
      landing,
      puddle,
    });
  }
  game.io.sfx('venomSpit', false, { x: fighter.x, dir: fighter.facing });
}

function splash(game, glob) {
  glob.dead = true;
  addSparks(game, { x: glob.x, y: glob.floor - 2, count: 6, color: FX_COLORS.venom, speed: 1.6 });
  game.projectiles.push({
    kind: 'puddle',
    x: glob.x,
    y: glob.floor,
    direction: glob.direction,
    speed: 0,
    side: glob.side,
    time: 0,
    life: glob.puddle,
    damage: PUDDLE_DAMAGE,
    hitTargets: new Set(),
  });
  game.io.sfx('splat', false, { vol: 0.5, x: glob.x });
}

// a glob arcs under its own weight and spreads into a puddle where it meets the ground; one that
// hits the hero on the way bursts on them instead
export function flyGlob(game, glob) {
  glob.y += glob.vy;
  glob.vy += GRAVITY;
  glob.floor = floorBelow(game.terrain, glob.x, Math.min(glob.y, glob.floor));
  if (glob.y >= glob.floor) {
    splash(game, glob);
  }
}

export function soakPuddle(_game, puddle) {
  puddle.dead = puddle.time >= puddle.life;
}
