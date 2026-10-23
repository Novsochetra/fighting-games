import { drawCrown } from './antler-crown.js';
import { ANTLER_PARTICLE_DRAWS } from './antler-particles.js';
import { drawPool } from './antler-pool.js';

// behind the hero: ghost fire pooling round its hooves and spirit antlers growing from its hood, so
// the sprite stands in front of both and nothing covers its face
function under(painter, layer) {
  drawPool(painter.context, layer);
  drawCrown(painter.context, layer);
}

// what the Antler Spirit Shade's heavies draw beyond what every Shade's share: particle kinds of its own, and
// layers under and over the hero while a heavy plays
export const ANTLER_HEAVY_RENDER = { particles: ANTLER_PARTICLE_DRAWS, under, over: null };
