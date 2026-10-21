import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame } from './fx-sheets.js';

// the strip's first frames are the lion taking shape and roaring, played once while it appears;
// the rest are its leap, looped while it runs
const RISE_FRAMES = 3;

export function lionFrame(lion, time) {
  const { ticks, frames } = FX_SPRITES.lion;
  if (time <= lion.appear) {
    return Math.min(RISE_FRAMES - 1, Math.floor((time / lion.appear) * RISE_FRAMES));
  }
  const leaping = Math.floor((time - lion.appear) / ticks);
  return RISE_FRAMES + (leaping % (frames - RISE_FRAMES));
}

// drawn solid like the sheet it comes from: its leap frames carry their own speed trails
export function drawLion(painter, sheets, lion) {
  drawFxFrame(painter, sheets, {
    name: 'lion',
    frame: lionFrame(lion, lion.time),
    x: lion.x,
    y: lion.y,
    scale: lion.scale,
    facing: lion.direction,
  });
}
