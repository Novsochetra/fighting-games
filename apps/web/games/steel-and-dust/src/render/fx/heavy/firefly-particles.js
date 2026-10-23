import { FIREFLY_HEAVY_ART as ART } from '../../../art/heavy-fx/firefly.js';
import { PIXEL, fineRect, flicker } from '../fine-pixels.js';
import { drawBug } from './firefly-bug.js';

const FLASH_RAYS = 8;

// thrown out white-hot, then blinking on and off as fireflies do, and dimming out at the end; one
// flying in to join the swarm lights up as it comes
function bugLevel(particle, age) {
  if (particle.joining) {
    return age < 2 ? 0 : 1;
  }
  if (age < 3) {
    return 2;
  }
  if (particle.life < particle.maxLife * 0.3) {
    return 0;
  }
  return flicker(particle.seed, Math.floor(age / 3)) > 0.3 ? 1 : 0;
}

function bugFade(particle, age) {
  if (particle.joining) {
    return Math.min((age + 1) / 2, particle.life / 2);
  }
  return (particle.life / particle.maxLife) * 3.5;
}

function fireflyBug(painter, particle) {
  const age = particle.maxLife - particle.life;
  drawBug(painter, {
    ...particle,
    level: bugLevel(particle, age),
    flap: (age + particle.seed) % 2,
    fade: bugFade(particle, age),
  });
}

// a pin of light whose arms blink on and off
function fireflyGlint(painter, particle) {
  const age = particle.maxLife - particle.life;
  const x = Math.round(particle.x);
  const y = Math.round(particle.y);
  painter.alpha(Math.min(1, (particle.life / particle.maxLife) * 2));
  painter.use(ART.lanternHot).rect(x, y, 1, 1);
  if (flicker(particle.seed, age >> 1) > 0.35) {
    const { context } = painter;
    context.fillStyle = ART.lantern;
    fineRect(context, { x: x - 1, y: y + 0.25, width: 3, height: PIXEL });
    fineRect(context, { x: x + 0.25, y: y - 1, width: PIXEL, height: 3 });
  }
  painter.alpha(1);
}

// cross arms that snap out and shrink back: long ahead of the strike, short behind it so it keeps
// off the hero, shorter still up and down
function drawCross(painter, { x, y, particle, grow }) {
  const { size, facing } = particle;
  const ahead = Math.round((3 + size * 3) * grow);
  const behind = 1;
  const rise = Math.round((1 + size) * grow);
  const left = facing > 0 ? x - behind : x - ahead;
  painter.use(ART.lanternHot).rect(left, y, ahead + behind + 1, 1);
  painter.rect(x, y - rise, 1, rise * 2 + 1);
  painter
    .use(ART.heart)
    .rect(x - 1, y, 3, 1)
    .rect(x, y - 1, 1, 3);
}

// the swarm's flash scattering as a ring of sparks, yellow and cyan by turns
function drawScatter(painter, { x, y, size, age }) {
  const radius = 2 + age * (1 + size);
  for (let i = 0; i < FLASH_RAYS; i++) {
    const angle = (i / FLASH_RAYS) * Math.PI * 2 + 0.4;
    painter
      .use(i % 2 ? ART.wing : ART.lantern)
      .rect(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius * 0.8, 1, 1);
  }
}

// every firefly lighting up at once: a white cross, then a ring of sparks
function fireflyFlash(painter, particle) {
  const age = particle.maxLife - particle.life;
  const x = Math.round(particle.x);
  const y = Math.round(particle.y);
  painter.alpha(Math.min(1, (particle.life / particle.maxLife) * 2));
  if (age < 3) {
    drawCross(painter, { x, y, particle, grow: [0.7, 1, 0.6][age] });
  }
  if (age >= 1) {
    drawScatter(painter, { x, y, size: particle.size, age });
  }
  painter.alpha(1);
}

export const FIREFLY_PARTICLE_DRAWS = { fireflyBug, fireflyGlint, fireflyFlash };
