import { ANGKOR_HEAVY_SOUNDS } from './angkor.js';
import { ANTLER_HEAVY_SOUNDS } from './antler.js';
import { BLUE_HEAVY_SOUNDS } from './blue.js';
import { BOKATOR_HEAVY_SOUNDS } from './bokator.js';
import { EMBER_HEAVY_SOUNDS } from './ember.js';
import { FIREFLY_HEAVY_SOUNDS } from './firefly.js';
import { MOSS_HEAVY_SOUNDS } from './moss.js';
import { heavyEmpty } from './shared.js';

// each Shade's heavy charge (and release, where it has one), and the fizzle of a heavy with no bar
export const HEAVY_SOUNDS = {
  heavyEmpty,
  ...MOSS_HEAVY_SOUNDS,
  ...FIREFLY_HEAVY_SOUNDS,
  ...ANTLER_HEAVY_SOUNDS,
  ...BLUE_HEAVY_SOUNDS,
  ...EMBER_HEAVY_SOUNDS,
  ...BOKATOR_HEAVY_SOUNDS,
  ...ANGKOR_HEAVY_SOUNDS,
};
