import { ANGKOR_HEAVY_ART as ART } from '../../../art/heavy-fx/angkor.js';

// a pillar of light springs up out of a petal of the seal as he strikes and sinks back into the
// ground, as the shafts rise out of the fissure his Thousand Cuts opens
const GROWS = 3;

export function shaftHeight(particle) {
  const age = particle.maxLife - particle.life;
  const share = age < GROWS ? (age + 1) / (GROWS + 1) : particle.life / (particle.maxLife - GROWS);
  return Math.round(particle.tall * Math.max(0, share));
}

export function drawShaft(painter, particle) {
  const height = shaftHeight(particle);
  if (height < 2) {
    return;
  }
  const { x, y } = particle;
  const core = Math.max(1, Math.round(height * 0.7));
  painter
    .alpha(0.45)
    .use(ART.lotusDeep)
    .rect(x - 1, y - height, 3, height);
  painter
    .alpha(0.95)
    .use(ART.hot)
    .rect(x, y - core, 1, core);
  painter
    .alpha(1)
    .use(ART.white)
    .rect(x, y - core, 1, 1);
}
