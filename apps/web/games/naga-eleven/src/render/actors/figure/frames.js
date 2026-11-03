import { createBuffer } from './buffer.js';
import { FIGURE_SPRITES, yawOf } from './figure-sprites.js';
import { finishBuffer } from './finish.js';
import { partsOf } from './parts.js';
import { POSES } from './poses.js';
import { paintParts } from './raster.js';

const painted = new Map();

export function figureFrame(animation, direction, frame) {
  const key = `${animation}:${direction}:${frame}`;
  const kept = painted.get(key);

  if (kept) {
    return kept;
  }

  const { width, height } = FIGURE_SPRITES.frame;
  const buffer = createBuffer(width, height, FIGURE_SPRITES.anchor);

  paintParts(buffer, partsOf(POSES[animation][frame], yawOf(animation, direction)));
  painted.set(key, finishBuffer(buffer));

  return buffer;
}
