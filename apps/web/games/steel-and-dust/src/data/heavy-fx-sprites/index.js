import { ANGKOR_HEAVY_FX_SPRITES } from './angkor.js';
import { ANTLER_HEAVY_FX_SPRITES } from './antler.js';
import { BLUE_HEAVY_FX_SPRITES } from './blue.js';
import { BOKATOR_HEAVY_FX_SPRITES } from './bokator.js';
import { EMBER_HEAVY_FX_SPRITES } from './ember.js';
import { FIREFLY_HEAVY_FX_SPRITES } from './firefly.js';
import { MOSS_HEAVY_FX_SPRITES } from './moss.js';

// every Shade's heavy strips, joined to FX_SPRITES so bursts can play them
export const HEAVY_FX_SPRITES = {
  ...MOSS_HEAVY_FX_SPRITES,
  ...FIREFLY_HEAVY_FX_SPRITES,
  ...ANTLER_HEAVY_FX_SPRITES,
  ...BLUE_HEAVY_FX_SPRITES,
  ...EMBER_HEAVY_FX_SPRITES,
  ...BOKATOR_HEAVY_FX_SPRITES,
  ...ANGKOR_HEAVY_FX_SPRITES,
};
