import { ANTLER_HEAVY_ART as ART } from '../../../art/heavy-fx/antler.js';
import { fxBetween, fxRandom } from '../fx-random.js';

const seedOf = (game) => Math.floor(fxRandom(game) * 4096);

// a tongue of teal ghost fire that sways as it climbs and burns down from white to smoke
export function addWisp(game, { x, y, vx = 0, vy = -0.7, life = 16 }) {
  game.particles.push({
    kind: 'antlerWisp',
    x,
    y,
    vx,
    vy,
    life,
    maxLife: life,
    phase: fxRandom(game) * Math.PI * 2,
  });
}

// a cloven hoofprint branded into the road in ghost fire, left where the stag pushes off
export function addHoof(game, { x, y }) {
  game.particles.push({ kind: 'antlerHoof', x, y, life: 28, maxLife: 28, seed: seedOf(game) });
}

// spirit antlers that burst out of a raider where a blow lands, pointing the way it was struck
export function addFork(game, { x, y, facing }) {
  const tilt = fxBetween(game, -0.35, 0.2);
  game.particles.push({ kind: 'antlerFork', x, y, facing, tilt, life: 9, maxLife: 9 });
}

// a streak of the charge, flying the way the strike goes
export function addRush(game, { x, y, vx, vy }) {
  game.particles.push({ kind: 'antlerRush', x, y, vx, vy, life: 7, maxLife: 7 });
}

// sand thrown back off the hooves as it pushes off, from the dressing's own random stream
export function kickDust(game, { x, y, direction, count }) {
  for (let i = 0; i < count; i++) {
    game.particles.push({
      kind: 'dust',
      x: x + fxBetween(game, -2, 2),
      y: y - 1,
      vx: direction * fxBetween(game, 0.6, 1.6),
      vy: -fxBetween(game, 0.2, 0.7),
      life: Math.round(fxBetween(game, 12, 18)),
      maxLife: 18,
      size: 1,
      color: ART.dust,
    });
  }
}

export const ANTLER_PARTICLE_MOVERS = {
  antlerWisp(particle) {
    const age = particle.maxLife - particle.life;
    particle.x += particle.vx + Math.sin(age * 0.5 + particle.phase) * 0.3;
    particle.y += particle.vy;
    particle.vx *= 0.9;
    particle.vy = particle.vy * 0.95 - 0.04;
  },
  antlerHoof() {},
  antlerFork() {},
  antlerRush(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.88;
    particle.vy *= 0.88;
  },
};
