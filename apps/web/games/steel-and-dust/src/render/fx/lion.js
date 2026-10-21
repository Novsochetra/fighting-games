import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame } from './fx-sheets.js';

// the strip's first frames are the lion taking shape and roaring, played once while it appears;
// the rest are its leap, looped while it runs
const RISE_FRAMES = 3;
const ECHOES = 2;

export function lionFrame(lion, time) {
  const { ticks, frames } = FX_SPRITES.lion;
  if (time <= lion.appear) {
    return Math.min(RISE_FRAMES - 1, Math.floor((time / lion.appear) * RISE_FRAMES));
  }
  const leaping = Math.floor((time - lion.appear) / ticks);
  return RISE_FRAMES + (leaping % (frames - RISE_FRAMES));
}

// the spirit lion glows through: see-through, with fading echoes of its leap behind it
export function drawLion(painter, sheets, lion) {
  for (let echo = ECHOES; echo >= 0; echo--) {
    const time = Math.max(0, lion.time - echo * 2);
    painter.alpha(echo ? 0.25 / echo : 0.95);
    drawFxFrame(painter, sheets, {
      name: 'lion',
      frame: lionFrame(lion, time),
      x: lion.x - lion.direction * echo * 10 * lion.scale,
      y: lion.y,
      scale: lion.scale,
      facing: lion.direction,
    });
  }
  painter.alpha(1);
}
