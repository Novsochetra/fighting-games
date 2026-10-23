import { BOKATOR_HEAVY_ART as ART } from '../../../art/heavy-fx/bokator.js';
import { floorBelow } from '../../stage/terrain.js';
import { fxBetween, fxRandom } from '../fx-random.js';

// the breath coils flatter than a circle, as if drawn in across the chest
const BREATH_SQUASH = 0.7;
const LEAF_FALL = 0.6;

const pick = (game, list) => list[Math.floor(fxRandom(game) * list.length)];

// gold breath drawn in: each mote spirals round the chest and reaches it as it fades
export function breathIn(game, at, { count, spin, life = 9 }) {
  for (let i = 0; i < count; i++) {
    const radius = fxBetween(game, 14, 22);
    const angle = fxRandom(game) * Math.PI * 2;
    game.particles.push({
      kind: 'bokatorBreath',
      x: at.x + Math.cos(angle) * radius,
      y: at.y + Math.sin(angle) * radius * BREATH_SQUASH,
      cx: at.x,
      cy: at.y,
      angle,
      radius,
      shrink: radius / life,
      spin,
      life,
      maxLife: life,
      color: ART.breath[i % ART.breath.length],
    });
  }
}

// bronze dust kicked along the ground by a planted foot
export function kickDust(game, { x, y, direction, count, speed }) {
  for (let i = 0; i < count; i++) {
    const life = Math.round(fxBetween(game, 10, 16));
    game.particles.push({
      kind: 'bokatorDust',
      x: x + fxBetween(game, -2, 2),
      y: y - fxBetween(game, 0, 2),
      vx: direction * fxBetween(game, speed * 0.5, speed),
      vy: -fxBetween(game, 0.1, 0.45),
      life,
      maxLife: life,
      size: Math.round(fxBetween(game, 1, 3)),
    });
  }
}

// the lion's roar as a blow is let go: two waves rolling out ahead of him from the chest, the
// second a beat behind the first
const ROAR_WAVES = [
  { radius: 10, grow: 3.2, life: 9 },
  { radius: 5, grow: 2.8, life: 10 },
];

export function roarWaves(game, at, direction) {
  for (const wave of ROAR_WAVES) {
    game.particles.push({
      kind: 'bokatorRoar',
      x: at.x,
      y: at.y,
      vx: 0,
      vy: 0,
      direction,
      radius: wave.radius,
      grow: wave.grow,
      life: wave.life,
      maxLife: wave.life,
    });
  }
}

// gold leaf flaking off the blow, turning in the light as it flutters down
export function shedLeaf(game, at, { count, lift, direction }) {
  for (let i = 0; i < count; i++) {
    const life = Math.round(fxBetween(game, 16, 24));
    game.particles.push({
      kind: 'bokatorLeaf',
      x: at.x + fxBetween(game, -2, 2),
      y: at.y + fxBetween(game, -2, 2),
      vx: direction * fxBetween(game, 0.2, 0.8) + fxBetween(game, -0.4, 0.4),
      vy: -fxBetween(game, lift * 0.4, lift),
      life,
      maxLife: life,
      phase: Math.floor(fxRandom(game) * 8),
      color: pick(game, ART.leaf),
    });
  }
}

// a lion's rake left across the blow: three slashes that strike in and cool; it outlasts the
// shared impact flash drawn over it, so the rake is still there once the flash has gone
export function rakeClaw(game, { x, y, direction, life }) {
  game.particles.push({ kind: 'bokatorClaw', x, y, vx: 0, vy: 0, direction, life, maxLife: life });
}

function bokatorBreath(particle) {
  particle.angle += particle.spin;
  particle.radius = Math.max(0, particle.radius - particle.shrink);
  particle.x = particle.cx + Math.cos(particle.angle) * particle.radius;
  particle.y = particle.cy + Math.sin(particle.angle) * particle.radius * BREATH_SQUASH;
}

function bokatorDust(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.vx *= 0.84;
  particle.vy *= 0.86;
}

function bokatorRoar(particle) {
  particle.radius += particle.grow;
  particle.grow *= 0.84;
}

// a leaf that reaches the ground lies there and glints until it fades
function bokatorLeaf(particle, terrain) {
  if (particle.landed) {
    return;
  }
  const lastY = particle.y;
  particle.vx *= 0.9;
  particle.vy = Math.min(LEAF_FALL, particle.vy + 0.06);
  particle.x += particle.vx + Math.sin((particle.life + particle.phase) * 0.55) * 0.3;
  particle.y += particle.vy;
  const floor = floorBelow(terrain, particle.x, lastY);
  if (particle.y > floor) {
    Object.assign(particle, { y: floor - 1, vx: 0, vy: 0, landed: true });
  }
}

function bokatorClaw() {}

export const BOKATOR_PARTICLE_MOVERS = {
  bokatorBreath,
  bokatorDust,
  bokatorRoar,
  bokatorLeaf,
  bokatorClaw,
};
