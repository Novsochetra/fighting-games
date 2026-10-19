import { FX_COLORS } from '../../art/fx-colors.js';
import { COLORS } from '../../art/colors.js';
import { point } from '../painter.js';

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

const DRAW_PARTICLE = { spark, dust, chunk, mote, streak };

export function drawParticles(painter, particles) {
  for (const particle of particles) {
    DRAW_PARTICLE[particle.kind](painter, particle);
  }
}
