import { VIEW_WIDTH } from '../../config.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 40;
// the patch art is drawn at the road's own density, a patch as wide as two heroes
const PATCH_SCALE = 2;
const { frames, ticks } = FX_SPRITES.quicksand;
// the patch is drawn down into the road, so only its far rim shows over the road's top edge and
// it lies in the road rather than on it
const SET_IN = 6;

// each patch swirls on its own beat, so two in view never turn in step
export function quicksandFrame(patch, tick) {
  return Math.floor((tick + patch.x) / ticks) % frames;
}

export function drawQuicksand(painter, sheets, { quicksand, cameraX, tick }) {
  for (const patch of quicksand) {
    if (patch.x > cameraX - MARGIN && patch.x < cameraX + VIEW_WIDTH + MARGIN) {
      const frame = quicksandFrame(patch, tick);

      drawFxFrame(painter, sheets, {
        name: 'quicksand',
        frame,
        x: patch.x,
        y: patch.y + SET_IN,
        scale: PATCH_SCALE,
      });
    }
  }
}
