import { parallaxPen } from '../../camera/world-pen.js';
import { GROUND } from '../../world.js';

// the play's own wide framing, so each far layer is drawn as it shows there
export const ANCHOR = { x: 400, y: 176 };

export const DEPTHS = { stars: 0.12, towers: 0.3, stand: 0.5, boards: 0.6 };

export const BOARDS = { top: 184, foot: 194 };

// the camera's distance from the players' plane, in art pixels, to place the pitch's markings
export const SIGHT = 1800;

export const layerPen = (context, camera, layer) =>
  parallaxPen(context, camera, { depth: DEPTHS[layer], anchor: ANCHOR });

export const depthOfDistance = (distance) => SIGHT / (SIGHT + distance);

// a row of grass lies `depth` as far off as the players' plane, as a far layer does: from the
// boards' depth at their foot to 1 at the feet, so the stripes and lines close in on the middle
export function groundOf(camera) {
  const far = BOARDS.foot + (camera.y - ANCHOR.y) * (1 - DEPTHS.boards);
  const perRow = (1 - DEPTHS.boards) / Math.max(8, GROUND - far);

  return {
    far,
    middle: camera.x,
    depthAt: (row) => 1 + (row - GROUND) * perRow,
    rowAt: (depth) => GROUND + (depth - 1) / perRow,
    xAt: (x, depth) => camera.x + (x - camera.x) * depth,
    worldX: (column, depth) => camera.x + (column - camera.x) / depth,
  };
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// a share of one colour over another as an even pixel pattern, never a blend
export const ditherAt = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
