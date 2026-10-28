import { FX_COLORS } from '../../art/fx-colors.js';
import { COLORS } from '../../art/colors.js';
import { clamp } from '../../lib/math.js';
import { shadeColor } from '../../lib/color.js';
import { point } from '../painter.js';
import { HEAVY_PARTICLE_DRAWS } from './heavy/index.js';

function spark(painter, particle) {
  const tail = point(particle.x - particle.vx * 1.5, particle.y - particle.vy * 1.5);
  painter.use(particle.color).line(point(particle.x, particle.y), tail, 1);
}

function dust(painter, particle) {
  painter.alpha(Math.max(0, particle.life / particle.maxLife) * 0.75);
  const radius = Math.max(1, Math.round(particle.size / 2) + 1);
  painter.use(particle.color).diamond(particle.x, particle.y, radius);
  if (radius > 1) {
    painter
      .use(FX_COLORS.dustHighlight)
      .rect(particle.x - radius + 1, particle.y - radius + 1, 2, 1);
  }
  painter.alpha(1);
}

function chunk(painter, particle) {
  painter.use(particle.color).rect(particle.x, particle.y, 2, 2);
}

function mote(painter, particle) {
  painter.alpha(Math.max(0, particle.life / particle.maxLife));
  painter.use(particle.color).rect(particle.x, particle.y, 1, 2);
  painter.alpha(1);
}

function streak(painter, particle) {
  painter.alpha((0.45 * particle.life) / particle.maxLife);
  const x = particle.vx > 0 ? particle.x - particle.length : particle.x;
  painter.use(COLORS.sand).rect(x, particle.y, particle.length, 1);
  painter.alpha(1);
}

// a leaf as the road's own falling leaves are drawn (ambient/leaves.js), turning over as it
// falls, flat once it lies on the ground, fading at the end
function leaf(painter, particle) {
  const flat = particle.resting || (particle.life >> 3) & 1;
  const [width, height] = flat ? [2, 1] : [1, 2];

  painter.alpha(Math.min(1, particle.life / 16));
  painter.use(particle.color).rect(particle.x, particle.y, width, height);
  painter.use(shadeColor(particle.color, 0.35)).rect(particle.x, particle.y, 1, 1);
  painter.alpha(1);
}

// a startled firefly as the road's own are drawn (ambient/fireflies.js), blinking as it drifts
function firefly(painter, particle) {
  const pulse = Math.sin(particle.life * 0.3 + particle.phase);
  const glow = clamp((pulse + 0.6) / 0.8, 0, 1) * Math.min(1, particle.life / 20);

  painter
    .use(particle.halo)
    .alpha(glow * 0.3)
    .rect(particle.x - 1, particle.y - 1, 3, 3);
  painter.use(particle.color).alpha(glow).rect(particle.x, particle.y, 1, 1);
  painter.alpha(1);
}

const DRAW_PARTICLE = {
  spark,
  dust,
  chunk,
  mote,
  streak,
  leaf,
  firefly,
  ...HEAVY_PARTICLE_DRAWS,
};

export function drawParticles(painter, particles) {
  for (const particle of particles) {
    DRAW_PARTICLE[particle.kind](painter, particle);
  }
}
