import { drawBlaze, drawStone } from './guard.js';
import { drawHalo, drawMotes, drawSwirl } from './sparks.js';

export const AURA_SHAPES = {
  motes: drawMotes,
  wind: drawSwirl,
  stone: drawStone,
  flame: drawBlaze,
  halo: drawHalo,
};
