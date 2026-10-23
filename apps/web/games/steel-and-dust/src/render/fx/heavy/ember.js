import { drawEmberOver, drawEmberUnder } from './ember-layers.js';
import { EMBER_PARTICLE_DRAWS } from './ember-particles.js';

// what the Ember Shade's heavies draw beyond what every Shade's share: cinders, swirling embers,
// flame tongues and flares of its own; fire round its feet and a phoenix wing under it, and its
// burning fist over it
export const EMBER_HEAVY_RENDER = {
  particles: EMBER_PARTICLE_DRAWS,
  under: drawEmberUnder,
  over: drawEmberOver,
};
