import { WORLD_VIEW } from '../../../config.js';
import { clampAlong } from '../../camera/bounds.js';
import { FOCUS_ROW, rowAt, scaleAt } from '../../camera/lens.js';

// room for the shake, which kicks the view a few pixels past where the camera may look
const SHAKE_ROOM = 12;

// the farthest the camera slides from the middle of the pitch, along x
function reachOf(lens, bounds) {
  const nearest = clampAlong(bounds, lens, { x: -Infinity, y: bounds.maxY });

  return bounds.length / 2 - nearest;
}

const halfWidthAt = (lens, bounds, scale) =>
  Math.ceil(reachOf(lens, bounds) * scale + WORLD_VIEW.width / 2 + SHAKE_ROOM);

// the ground is drawn once from the far edge of what the venue lays to its near edge: a row of it
// is a depth, and a column a world x seen at that row's scale
export function groundFrame(lens, bounds, { far, near }) {
  const rowTop = Math.floor(rowAt(lens, far));
  const rowBottom = Math.ceil(rowAt(lens, near));
  const middle = halfWidthAt(lens, bounds, rowBottom / lens.height);

  return {
    rowTop,
    height: rowBottom - rowTop,
    width: middle * 2,
    middle,
    x: bounds.length / 2,
    reach: reachOf(lens, bounds) + SHAKE_ROOM,
  };
}

// the columns a row of the ground can ever show: the rest of the picture is never seen
export function columnsAt(frame, scale) {
  const half = Math.ceil(frame.reach * scale + WORLD_VIEW.width / 2);

  return { from: Math.max(0, frame.middle - half), to: Math.min(frame.width, frame.middle + half) };
}

// the highest row the view ever shows, counted from the horizon as rowAt counts
const topRowOf = (lens, bounds) => rowAt(lens, bounds.minY) - FOCUS_ROW - SHAKE_ROOM;

// a flat picture standing at one depth: what stands, seen side on, all at one scale
export function billboardFrame(lens, bounds, { depth, base = depth, height }) {
  const scale = scaleAt(lens, depth);
  const baseRow = Math.round(rowAt(lens, base));
  const tall = height === 'toTop' ? Math.ceil(baseRow - topRowOf(lens, bounds)) : height;
  const middle = halfWidthAt(lens, bounds, scale);

  return {
    scale,
    baseRow,
    height: Math.max(1, tall),
    width: middle * 2,
    middle,
    x: bounds.length / 2,
  };
}

// the column a world x falls on, in a frame, at a scale
export const columnOf = (frame, x, scale = frame.scale) =>
  Math.round((x - frame.x) * scale + frame.middle);

export const worldXOf = (frame, column, scale = frame.scale) =>
  (column - frame.middle) / scale + frame.x;
