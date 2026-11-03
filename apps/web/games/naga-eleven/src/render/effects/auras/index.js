import { kitAura } from '../kit-sprites.js';
import { drawStone } from './guard.js';
import { drawHalo, drawSwirl } from './sparks.js';

export const AURA_SHAPES = {
  motes: kitAura('motes'),
  wind: drawSwirl,
  stone: drawStone,
  flame: kitAura('blaze'),
  halo: drawHalo,
};
