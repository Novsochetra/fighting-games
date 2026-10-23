import { FIREFLY_PARTICLE_DRAWS } from './firefly-particles.js';
import { drawSwarmBehind, drawSwarmInFront } from './firefly-layers.js';

// what the Firefly Shade's heavies draw beyond what every Shade's share: particle kinds of its own, and
// layers under and over the hero while a heavy plays: the swarm gathering round it, the far side of
// its circle behind the hero and the near side in front
export const FIREFLY_HEAVY_RENDER = {
  particles: FIREFLY_PARTICLE_DRAWS,
  under: drawSwarmBehind,
  over: drawSwarmInFront,
};
