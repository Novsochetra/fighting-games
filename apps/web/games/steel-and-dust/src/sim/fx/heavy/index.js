import { ANGKOR_HEAVY_KIT } from './angkor.js';
import { ANTLER_HEAVY_KIT } from './antler.js';
import { BLUE_HEAVY_KIT } from './blue.js';
import { BOKATOR_HEAVY_KIT } from './bokator.js';
import { EMBER_HEAVY_KIT } from './ember.js';
import { FIREFLY_HEAVY_KIT } from './firefly.js';
import { MOSS_HEAVY_KIT } from './moss.js';

export const HEAVY_KITS = {
  moss: MOSS_HEAVY_KIT,
  firefly: FIREFLY_HEAVY_KIT,
  antler: ANTLER_HEAVY_KIT,
  blue: BLUE_HEAVY_KIT,
  ember: EMBER_HEAVY_KIT,
  bokator: BOKATOR_HEAVY_KIT,
  angkor: ANGKOR_HEAVY_KIT,
};

// every Shade's own particle kinds, moved beside the shared ones (update-effects.js)
export const HEAVY_PARTICLE_MOVERS = Object.assign(
  {},
  ...Object.values(HEAVY_KITS).map((kit) => kit.particles),
);
