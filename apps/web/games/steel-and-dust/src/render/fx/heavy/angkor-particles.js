import { ANGKOR_HEAVY_ART as ART } from '../../../art/heavy-fx/angkor.js';
import { easeOutCubic } from '../../../lib/math.js';
import { point } from '../../painter.js';
import { flicker } from '../fine-pixels.js';
import { fineDiamond } from './angkor-pixels.js';
import { drawShaft } from './angkor-shaft.js';

// full strength until the last `tail` share of its life, then fading out
function fade(particle, tail) {
  return Math.min(1, particle.life / (particle.maxLife * tail));
}

// a stone grain or chip; a big one is lit at its top corner and shadowed at the opposite one, and
// grit glints now and then as it hangs
function stone(painter, particle, { tail, glints }) {
  const { size } = particle;
  const top = particle.y - size;
  const glint = glints && flicker(particle.maxLife * 31 + size, particle.life >> 1) > 0.8;
  painter.alpha(fade(particle, tail));
  painter.use(glint ? ART.white : particle.color).rect(particle.x, top, size, size);
  if (size > 1) {
    painter.use(ART.rim).rect(particle.x, top, 1, 1);
    painter.use(ART.stoneShade).rect(particle.x + size - 1, top + size - 1, 1, 1);
  }
  painter.alpha(1);
}

// a petal is a small diamond on the sprites' pixel grid, edged a deeper pink so it reads on pale
// skies, its heart a shade paler
function petal(painter, particle) {
  const { context } = painter;
  const at = { x: particle.x, y: particle.y };
  context.globalAlpha = fade(particle, 0.4);
  context.fillStyle = ART.lotusDim;
  fineDiamond(context, { ...at, radius: particle.size + 1 });
  context.fillStyle = particle.color;
  fineDiamond(context, { ...at, radius: particle.size });
  context.fillStyle = ART.hot;
  fineDiamond(context, { ...at, radius: 0 });
  context.globalAlpha = 1;
}

function bloomPetal(painter, { particle, angle, reach, young }) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const inner = point(particle.x + cos * reach * 0.3, particle.y + sin * reach * 0.3);
  const tip = point(particle.x + cos * reach, particle.y + sin * reach);
  painter.use(ART.lotusDeep).line(inner, tip, 1);
  painter.use(young ? ART.hot : ART.lotus).diamond(tip.x, tip.y, 1);
}

// a lotus of light opening where a blow lands, eight petals pushing out round a gold heart; pink,
// not white, so it shows on a raider flashing white as he is hit
function bloom(painter, particle) {
  const progress = 1 - particle.life / particle.maxLife;
  const reach = (particle.small ? 5 : 8) * easeOutCubic(Math.min(1, 0.25 + progress * 1.6));
  const young = progress < 0.35;
  painter.alpha(progress < 0.55 ? 1 : (1 - progress) / 0.45);
  for (let i = 0; i < 8; i++) {
    const angle = (particle.spin + i / 8) * Math.PI * 2;
    bloomPetal(painter, { particle, angle, reach, young });
  }
  painter.use(ART.gold).diamond(particle.x, particle.y, young ? 2 : 1);
  painter.alpha(1);
}

export const ANGKOR_PARTICLE_DRAWS = {
  angkorGrit: (painter, particle) => stone(painter, particle, { tail: 0.4, glints: true }),
  angkorChip: (painter, particle) => stone(painter, particle, { tail: 0.3, glints: false }),
  angkorSand: (painter, particle) => stone(painter, particle, { tail: 0.5, glints: true }),
  angkorPetal: petal,
  angkorSwirl: petal,
  angkorBloom: bloom,
  angkorShaft: drawShaft,
};
