import { BOKATOR_HEAVY_ART as ART } from '../../../art/heavy-fx/bokator.js';
import { point } from '../../painter.js';

// the three slashes of a claw rake: where each starts beside the blow and how far it reaches
const CLAWS = [
  { dx: -6, dy: -10, reach: 0.8 },
  { dx: -2, dy: -12, reach: 1 },
  { dx: 2, dy: -10, reach: 0.8 },
];
const CLAW_RUN = { x: 7, y: 17 };
const ROAR_HALF_ANGLE = 0.95;

// the tail is where the mote was a tick and a half ago on its spiral
function bokatorBreath(painter, particle) {
  const angle = particle.angle - particle.spin * 1.5;
  const radius = particle.radius + particle.shrink * 1.5;
  const tail = point(
    particle.cx + Math.cos(angle) * radius,
    particle.cy + Math.sin(angle) * radius * 0.7,
  );
  painter.use(ART.breathTail).line(tail, point(particle.x, particle.y), 1);
  painter.use(particle.color).rect(particle.x, particle.y, 1, 1);
}

function bokatorDust(painter, particle) {
  const share = particle.life / particle.maxLife;
  const height = particle.size > 2 ? 2 : 1;
  painter.alpha(share > 0.5 ? 0.85 : 0.45);
  painter
    .use(share > 0.6 ? ART.dustLight : ART.dust)
    .rect(particle.x - particle.size / 2, particle.y - height, particle.size + 1, height);
  painter.alpha(1);
}

// an arc of the roar rolling out ahead of him, a pixel a step so it never breaks, cooling as it
// spreads; while young its middle is doubled, the loudest part of the roar
function bokatorRoar(painter, particle) {
  const age = particle.maxLife - particle.life;
  const steps = Math.max(4, Math.round(particle.radius * ROAR_HALF_ANGLE * 2));
  painter.alpha(particle.life > 3 ? 1 : 0.5);
  painter.use(ART.roar[Math.min(age, ART.roar.length - 1)]);
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps - 0.5) * 2 * ROAR_HALF_ANGLE;
    const thick = age < 4 && Math.abs(angle) < ROAR_HALF_ANGLE / 2 ? 2 : 1;
    const x = particle.x + particle.direction * Math.cos(angle) * particle.radius;
    const y = particle.y + Math.sin(angle) * particle.radius;
    painter.rect(x - (particle.direction < 0 ? 0 : thick - 1), y, thick, 1);
  }
  painter.alpha(1);
}

// flat to the light it shines as a fleck, edge-on it is a dark speck
function bokatorLeaf(painter, particle) {
  const flat = ((particle.life + particle.phase) >> 1) & 1;
  painter.alpha(particle.life > 4 ? 1 : 0.5);
  if (flat) {
    painter.use(particle.color).rect(particle.x, particle.y, 2, 1);
  } else {
    painter.use(ART.leafEdge).rect(particle.x, particle.y, 1, 1);
  }
  painter.alpha(1);
}

// each slash rakes in over two ticks, white-hot, then cools through gold to bronze; a bronze edge
// behind it keeps it readable over a raider flashing white
function bokatorClaw(painter, particle) {
  const age = particle.maxLife - particle.life;
  const grow = Math.min(1, (age + 1) / 2);
  const facing = particle.direction;
  const hot = age < ART.claw.length;
  painter.alpha(particle.life > 4 ? 1 : 0.6);
  for (const claw of CLAWS) {
    const from = point(particle.x + facing * claw.dx, particle.y + claw.dy);
    const reach = grow * claw.reach;
    const to = point(from.x + facing * CLAW_RUN.x * reach, from.y + CLAW_RUN.y * reach);
    if (hot) {
      const edge = (at) => point(at.x - facing, at.y);
      painter.use(ART.clawShade).line(edge(from), edge(to), 1);
    }
    painter.use(hot ? ART.claw[age] : ART.clawShade).line(from, to, 1);
  }
  painter.alpha(1);
}

export const BOKATOR_PARTICLE_DRAWS = {
  bokatorBreath,
  bokatorDust,
  bokatorRoar,
  bokatorLeaf,
  bokatorClaw,
};
