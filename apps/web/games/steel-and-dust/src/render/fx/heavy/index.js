import { ANGKOR_HEAVY_RENDER } from './angkor.js';
import { ANTLER_HEAVY_RENDER } from './antler.js';
import { BLUE_HEAVY_RENDER } from './blue.js';
import { BOKATOR_HEAVY_RENDER } from './bokator.js';
import { EMBER_HEAVY_RENDER } from './ember.js';
import { FIREFLY_HEAVY_RENDER } from './firefly.js';
import { MOSS_HEAVY_RENDER } from './moss.js';

export const HEAVY_RENDERS = {
  moss: MOSS_HEAVY_RENDER,
  firefly: FIREFLY_HEAVY_RENDER,
  antler: ANTLER_HEAVY_RENDER,
  blue: BLUE_HEAVY_RENDER,
  ember: EMBER_HEAVY_RENDER,
  bokator: BOKATOR_HEAVY_RENDER,
  angkor: ANGKOR_HEAVY_RENDER,
};

// every Shade's own particle kinds, drawn beside the shared ones (particles.js)
export const HEAVY_PARTICLE_DRAWS = Object.assign(
  {},
  ...Object.values(HEAVY_RENDERS).map((render) => render.particles),
);
