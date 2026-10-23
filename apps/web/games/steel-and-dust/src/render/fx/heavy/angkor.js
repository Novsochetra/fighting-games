import { ANGKOR_PARTICLE_DRAWS } from './angkor-particles.js';
import { drawSealHalf, sealOf } from './angkor-seal.js';

function sealLayer(front) {
  return (painter, layer) => {
    const seal = sealOf(layer.art, layer);
    if (seal) {
      const { fighter, art } = layer;
      drawSealHalf(painter, { seal, art, x: fighter.x, y: fighter.y, front });
    }
  };
}

// a lotus seal opens on the ground under him as he winds up and bursts as he strikes; its back
// half is drawn under him and its front half over his feet, so it rings him
export const ANGKOR_HEAVY_RENDER = {
  particles: ANGKOR_PARTICLE_DRAWS,
  under: sealLayer(false),
  over: sealLayer(true),
};
