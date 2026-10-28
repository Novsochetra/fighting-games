import { DROP } from '../../data/ambush.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame } from './fx-sheets.js';
import { drawLandingShadow } from './rock-hazards.js';

// how far above the spot the shadow is drawn as if the raider were, per tick still to wait
const SINK = 3;
const MOUND_SCALE = 0.75;

// the spot a raider drops on is marked as a pounce's is, a shadow that grows and darkens under a
// blinking red bar, while it waits in the trees and then as it comes down
export function drawDropMark(painter, mark) {
  if (mark.landed) {
    return;
  }

  const y = mark.raider ? mark.raider.y : mark.y - (DROP.warn - mark.time) * SINK;

  drawLandingShadow(painter, { x: mark.x, floor: mark.y, y, time: mark.time });
}

// a mound loops its strip as it crawls, and quicker, shaking, as it stops to rumble
export function drawMound(painter, mound, sheets) {
  if (mound.eruptAt) {
    return;
  }

  const { frames, ticks } = FX_SPRITES.mound;
  const rumbling = mound.haltAt > 0;
  const frame = Math.floor(mound.time / (rumbling ? 3 : ticks)) % frames;
  const shakeX = rumbling ? ((mound.time >> 1) & 1) * 2 - 1 : 0;

  drawFxFrame(painter, sheets, {
    name: 'mound',
    frame,
    x: mound.x + shakeX,
    y: mound.y,
    scale: MOUND_SCALE,
    facing: mound.direction,
  });
}
