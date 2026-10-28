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
// the row of the patch art through the middle of its sand, between the rocks of its two rims
const PIT_ROW = 9;

// how far below the road's top edge the middle of a patch's sand lies, where a body sinks; the art
// is drawn at the road's density, a pixel of it to a pixel of the world
export const PIT_MIDDLE = SET_IN + PIT_ROW - FX_SPRITES.quicksand.anchorY;

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
