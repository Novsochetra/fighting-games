import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../config.js';
import { hashInt } from '../../../lib/math.js';

export const MARGIN = 16;
export const CYCLE_WIDTH = VIEW_WIDTH + MARGIN * 2;
export const TAU = Math.PI * 2;

export function wrapX(value, width) {
  return ((value % width) + width) % width;
}

// wrapping over a cycle a little wider than the view makes things enter and leave off-screen
export function scrollX(baseX, { cameraX, drift = 0, margin = MARGIN }) {
  return wrapX(baseX - cameraX * drift + margin, VIEW_WIDTH + margin * 2) - margin;
}

// per-particle constants come from hashes, never Math.random, so recorded frames replay exactly
export function trait(seed, slot) {
  return hashInt(hashInt(seed) + slot) / 4294967296;
}

export function twoFrame(ticks, frameTicks) {
  return Math.floor(ticks / frameTicks) & 1;
}

export function isOnScreen(x, y, size) {
  const left = Math.round(x);
  const top = Math.round(y);
  return left + size > 0 && left < VIEW_WIDTH && top + size > 0 && top < VIEW_HEIGHT;
}

export function fillClipped(painter, { x, y, width, height }) {
  const left = Math.max(0, x);
  const right = Math.min(VIEW_WIDTH, x + width);
  if (right > left) {
    painter.rect(left, y, right - left, height);
  }
}
