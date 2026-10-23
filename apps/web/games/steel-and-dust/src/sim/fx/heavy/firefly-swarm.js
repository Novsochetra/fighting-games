import { fxBetween, fxRandom } from '../fx-random.js';
import { chestOf } from './default-kit.js';

// a firefly of the heavy's swarm; its seed keeps its blinking and flutter its own while drawn, and
// `turn` bends its flight round by that much each tick
export function spawnBug(game, at, motion) {
  const { vx, vy, life, drag = 0.9, lift = 0.02, wobble = 0.3, turn = 0, joining = false } = motion;
  game.particles.push({
    kind: 'fireflyBug',
    x: at.x,
    y: at.y,
    vx,
    vy,
    life,
    maxLife: life,
    drag,
    lift,
    wobble,
    turn,
    joining,
    seed: Math.floor(fxRandom(game) * 9973),
  });
}

// a firefly flying in from the dark on a curve that ends at `to` as its life does: it turns `bend`
// radians in all, a step each tick before it moves, so its steps lean round the straight line
// evenly and add up to it
export function spawnJoiner(game, to, { radius, life, bend }) {
  const angle = fxRandom(game) * Math.PI * 2;
  const distance = fxBetween(game, radius * 0.75, radius);
  const from = { x: to.x + Math.cos(angle) * distance, y: to.y + Math.sin(angle) * distance * 0.6 };
  const turn = bend / life;
  const chord = Math.hypot(to.x - from.x, to.y - from.y);
  const heading = Math.atan2(to.y - from.y, to.x - from.x) - (turn * (life + 1)) / 2;
  const speed = (chord * Math.sin(turn / 2)) / Math.sin(bend / 2);
  const motion = { vx: Math.cos(heading) * speed, vy: Math.sin(heading) * speed, life };
  spawnBug(game, from, { ...motion, drag: 1, lift: 0, wobble: 0, turn, joining: true });
}

// a twinkle of light popping on near a point and drifting up as it blinks
export function spawnGlint(game, at, { spread, life }) {
  game.particles.push({
    kind: 'fireflyGlint',
    x: at.x + fxBetween(game, -spread, spread),
    y: at.y + fxBetween(game, -spread, spread) * 0.8,
    vx: fxBetween(game, -0.2, 0.2),
    vy: -fxBetween(game, 0.1, 0.4),
    life,
    maxLife: life,
    seed: Math.floor(fxRandom(game) * 9973),
  });
}

// the whole swarm flashing at once
export function spawnFlash(game, at, { size, facing, life = 7 }) {
  game.particles.push({
    kind: 'fireflyFlash',
    x: at.x,
    y: at.y,
    vx: 0,
    vy: 0,
    life,
    maxLife: life,
    size,
    facing,
  });
}

// where the blow lands: the middle of the move's reach, or the chest of a move without one
export function strikePointOf(fighter, move) {
  if (!move.hitbox) {
    return chestOf(fighter);
  }
  const [x, y, width, height] = move.hitbox;
  return { x: fighter.x + fighter.facing * (x + width / 2), y: fighter.y + y + height / 2 };
}

// a unit step from one point toward another, turned by `spread` radians
export function aimFrom(from, to, spread) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x) + spread;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function between(from, to, share) {
  return { x: from.x + (to.x - from.x) * share, y: from.y + (to.y - from.y) * share };
}
