import { floorBelow } from '../../stage/terrain.js';
import { fxBetween, fxRandom } from '../fx-random.js';

const SHARD_FALL = 0.16;
const SHARD_DRAG = 0.93;

function addParticle(game, particle) {
  game.particles.push({ maxLife: particle.life, ...particle });
}

// cold mist pulled from a ring round the point into it, flattened so it streams in sideways
export function drawInMist(game, at, { radius, life, color }) {
  const angle = fxRandom(game) * Math.PI * 2;
  const dx = Math.cos(angle) * radius;
  const dy = Math.sin(angle) * radius * 0.45;
  const vx = -dx / life;
  addParticle(game, {
    kind: 'blueMist',
    x: at.x + dx,
    y: at.y + dy,
    vx,
    vy: -dy / life,
    life,
    color,
  });
}

// mist pushed along the ground or out of the body, slowing as it spreads
export function pushMist(game, at, { vx, life, color }) {
  const y = at.y + fxBetween(game, -1, 1);
  addParticle(game, { kind: 'blueMist', x: at.x, y, vx, vy: 0, life, color, drag: 0.9 });
}

// a crystal that grows where frost gathers and breaks the moment the heavy strikes
export function formCrystal(game, at, life) {
  const x = at.x + fxBetween(game, -2, 2);
  addParticle(game, {
    kind: 'blueCrystal',
    x,
    y: at.y + fxBetween(game, -2, 2),
    vx: 0,
    vy: 0,
    life,
  });
}

// ice shards thrown in a cone round `angle`, falling and lying glinting where they land
export function throwShards(game, at, { count, angle, spread, speed }) {
  for (let i = 0; i < count; i++) {
    const heading = angle + fxBetween(game, -spread, spread);
    const velocity = fxBetween(game, speed * 0.5, speed);
    addParticle(game, {
      kind: 'blueShard',
      x: at.x,
      y: at.y,
      vx: Math.cos(heading) * velocity,
      vy: Math.sin(heading) * velocity,
      life: Math.round(fxBetween(game, 16, 24)),
    });
  }
}

// frost left hanging where the blade passed, drifting off behind the swing
export function shedFlake(game, at, direction) {
  addParticle(game, {
    kind: 'blueFlake',
    x: at.x + fxBetween(game, -2, 2),
    y: at.y + fxBetween(game, -2, 2),
    vx: direction * fxBetween(game, 0.15, 0.5),
    vy: fxBetween(game, 0, 0.25),
    life: Math.round(fxBetween(game, 14, 20)),
  });
}

export function flashAt(game, at, size) {
  addParticle(game, { kind: 'blueFlash', x: at.x, y: at.y, vx: 0, vy: 0, life: 4, size });
}

export function cutAt(game, at, angle) {
  addParticle(game, { kind: 'blueCut', x: at.x, y: at.y, vx: 0, vy: 0, life: 8, angle });
}

function drift(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;
}

function mist(particle) {
  drift(particle);
  if (particle.drag) {
    particle.vx *= particle.drag;
  }
}

function shard(particle, terrain) {
  if (particle.landed) {
    return;
  }
  const lastY = particle.y;
  particle.vy += SHARD_FALL;
  particle.vx *= SHARD_DRAG;
  drift(particle);
  const floor = floorBelow(terrain, particle.x, lastY);
  if (particle.y >= floor) {
    Object.assign(particle, { y: floor - 1, landed: true });
  }
}

// a flake sways as it settles, on a beat of its own life so it stays steady
function flake(particle) {
  drift(particle);
  particle.x += (particle.life >> 2) % 2 ? 0.12 : -0.12;
}

function stay() {}

export const BLUE_PARTICLE_MOVERS = {
  blueMist: mist,
  blueCrystal: stay,
  blueShard: shard,
  blueFlake: flake,
  blueFlash: stay,
  blueCut: stay,
};
