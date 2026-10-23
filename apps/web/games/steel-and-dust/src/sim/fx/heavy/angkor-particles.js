import { floorBelow } from '../../stage/terrain.js';

const CHIP_GRAVITY = 0.22;
const SAND_GRAVITY = 0.09;

function drift(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;
}

// the Angkor Warrior's own particle kinds; the updater counts their lives down
export const ANGKOR_PARTICLE_MOVERS = {
  // grit lifted off the ground by the gathering power: it rises, slows and hangs in the air
  angkorGrit(particle) {
    drift(particle);
    particle.vx *= 0.9;
    particle.vy *= 0.9;
  },
  // a chip of sandstone knocked loose: it falls, skips off the ground and settles
  angkorChip(particle, terrain) {
    const lastY = particle.y;
    particle.vy += CHIP_GRAVITY;
    drift(particle);
    const floor = floorBelow(terrain, particle.x, lastY);
    if (particle.y > floor) {
      particle.y = floor;
      particle.vy *= -0.35;
      particle.vx *= 0.55;
    }
  },
  // a lotus petal carried on the air: it slows and sinks a little as it goes
  angkorPetal(particle) {
    drift(particle);
    particle.vx *= 0.9;
    particle.vy = particle.vy * 0.9 + 0.03;
  },
  // pink light drawn in to the gathering point, turning as it closes in
  angkorSwirl(particle) {
    particle.angle += particle.spin;
    particle.radius *= 0.8;
    particle.x = particle.centerX + Math.cos(particle.angle) * particle.radius;
    particle.y = particle.centerY + Math.sin(particle.angle) * particle.radius * 0.8;
  },
  // sand pouring off the cut
  angkorSand(particle) {
    particle.vy += SAND_GRAVITY;
    particle.vx *= 0.88;
    drift(particle);
  },
  // a lotus opening where a blow lands, and a pillar of light out of the seal: both stay put
  angkorBloom() {},
  angkorShaft() {},
};
