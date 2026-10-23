import { floorBelow } from '../../stage/terrain.js';

const LEAF_DRAG = 0.9;
const LEAF_FALL = 0.05;
const THORN_DRAG = 0.8;

// a leaf drawn in by a gathering heavy flies straight at its core, swaying, and is gone as it arrives
function pullLeaf(particle) {
  particle.x += particle.vx + Math.sin(particle.phase + particle.life) * 0.4;
  particle.y += particle.vy;
}

function fallLeaf(particle, terrain) {
  particle.vx *= LEAF_DRAG;
  particle.vy = particle.vy * LEAF_DRAG + LEAF_FALL;
  const lastY = particle.y;
  particle.x += particle.vx + Math.sin(particle.phase + particle.life * 0.5) * 0.3;
  particle.y += particle.vy;
  const floor = floorBelow(terrain, particle.x, lastY);
  if (particle.y >= floor) {
    particle.y = floor;
    particle.landed = true;
  }
}

// how the Moss Shade's own particle kinds move each tick (the updater counts their life down)
export const MOSS_PARTICLE_MOVERS = {
  mossSpore(particle) {
    particle.x += particle.vx + Math.sin(particle.phase + particle.life * 0.45) * 0.25;
    particle.y += particle.vy;
    particle.vx *= 0.93;
    particle.vy = particle.vy * 0.93 - 0.012;
  },
  mossLeaf(particle, terrain) {
    if (particle.pulled) {
      pullLeaf(particle);
    } else if (!particle.landed) {
      fallLeaf(particle, terrain);
    }
  },
  mossThorn(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= THORN_DRAG;
    particle.vy *= THORN_DRAG;
  },
  // a bramble stays rooted where it grew
  mossBramble() {},
};
