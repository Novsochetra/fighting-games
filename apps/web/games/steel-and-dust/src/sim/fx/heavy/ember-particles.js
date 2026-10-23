import { fxBetween, fxRandom } from '../fx-random.js';

// fire rises: cinders and flames float upward as they slow
const CINDER_LIFT = 0.035;
const FLAME_LIFT = 0.07;
// a swirling ember spins faster as it closes in, as a skater does pulling in her arms
const SWIRL_SPEEDUP = 2;

const seedOf = (game) => Math.floor(fxRandom(game) * 100000);

// an angle in radians from degrees measured the way the fighter faces: 0 ahead, -90 straight up
export function heading(facing, degrees) {
  const radians = (degrees * Math.PI) / 180;
  return facing === 1 ? radians : Math.PI - radians;
}

// where a thrown particle starts and how fast it goes; a burst let go into a hitstop starts up to
// `lead` ticks along its way, so the frozen frame shows it already flung wide
function launch(game, at, { angle, spread, speed, lead = 0 }) {
  const direction = angle + fxBetween(game, -spread, spread);
  const velocity = fxBetween(game, speed * 0.5, speed);
  const vx = Math.cos(direction) * velocity;
  const vy = Math.sin(direction) * velocity;
  const ahead = fxBetween(game, 0, lead);
  return { x: at.x + vx * ahead, y: at.y + vy * ahead, vx, vy };
}

// glowing cinders flung from a point along an angle (radians), give or take `spread`
export function throwCinders(game, at, { count, life, ...aim }) {
  for (let i = 0; i < count; i++) {
    const span = Math.round(fxBetween(game, life * 0.7, life));
    game.particles.push({
      kind: 'emberCinder',
      ...launch(game, at, aim),
      life: span,
      maxLife: span,
      seed: seedOf(game),
    });
  }
}

// tongues of flame thrown from a point; each licks upward and burns down as it goes
export function throwFlames(game, at, { count, size, life, ...aim }) {
  for (let i = 0; i < count; i++) {
    game.particles.push({
      kind: 'emberFlame',
      ...launch(game, at, aim),
      size: size * fxBetween(game, 0.75, 1),
      life,
      maxLife: life,
      seed: seedOf(game),
    });
  }
}

// an ember drawn in on a closing spiral round a point, arriving just as its life runs out
export function swirlIn(game, at, { radius, life, spin, carry }) {
  const angle = fxRandom(game) * Math.PI * 2;
  const x = at.x + Math.cos(angle) * radius;
  const y = at.y + Math.sin(angle) * radius;
  game.particles.push({
    kind: 'emberSwirl',
    ...{ x, y, px: x, py: y, centerX: at.x, centerY: at.y },
    ...{ angle, radius, startRadius: radius, spin, carryX: carry.x, carryY: carry.y },
    life,
    maxLife: life,
    seed: seedOf(game),
  });
}

// a burst of fire where a heavy strikes or lands, flaring wide and shrinking away
export function addFlare(game, { x, y, size, life, facing }) {
  game.particles.push({
    kind: 'emberFlare',
    x,
    y,
    vx: 0,
    vy: 0,
    size,
    life,
    maxLife: life,
    facing,
    seed: seedOf(game),
  });
}

export const EMBER_PARTICLE_MOVERS = {
  emberCinder(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.92;
    particle.vy = particle.vy * 0.92 - CINDER_LIFT;
  },
  emberFlame(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.84;
    particle.vy = particle.vy * 0.84 - FLAME_LIFT;
  },
  emberSwirl(particle) {
    particle.px = particle.x;
    particle.py = particle.y;
    particle.centerX += particle.carryX;
    particle.centerY += particle.carryY;
    particle.radius -= particle.radius / (particle.life + 1);
    const closed = 1 - particle.radius / particle.startRadius;
    particle.angle += particle.spin * (1 + closed * SWIRL_SPEEDUP);
    particle.x = particle.centerX + Math.cos(particle.angle) * particle.radius;
    particle.y = particle.centerY + Math.sin(particle.angle) * particle.radius * 0.8;
  },
  emberFlare() {},
};
