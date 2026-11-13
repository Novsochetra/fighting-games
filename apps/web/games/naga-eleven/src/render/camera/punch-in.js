import { WORLD_VIEW } from '../../config.js';

// twice as big, never a share more: the footballers' sprites keep every pixel square
export const PUNCH_SCALE = 2;

// how far over his feet the camera centres on a player, about the middle of the 58 px sprite
const CHEST_RISE = 30;

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

export function punchTransform(focus) {
  const halfWidth = WORLD_VIEW.width / 2 / PUNCH_SCALE;
  const halfHeight = WORLD_VIEW.height / 2 / PUNCH_SCALE;
  const x = clamp(focus.x, halfWidth, WORLD_VIEW.width - halfWidth);
  const y = clamp(focus.y, halfHeight, WORLD_VIEW.height - halfHeight);

  return {
    scale: PUNCH_SCALE,
    x: Math.round(WORLD_VIEW.width / 2 - x * PUNCH_SCALE),
    y: Math.round(WORLD_VIEW.height / 2 - y * PUNCH_SCALE),
  };
}

export const chestOf = (point) => ({ x: point.x, y: point.y - CHEST_RISE });
