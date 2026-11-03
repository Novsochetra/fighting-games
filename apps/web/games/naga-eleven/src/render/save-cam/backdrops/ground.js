import { ART, INNER } from '../../duel/layout.js';
import { acrossAt, DEPTH, depthOfRow, FRAME, HORIZON, project } from '../view.js';

// the ground from the horizon down, a pixel at a time: `surface(spot, column, row)` gives the
// packed colour of the bit of ground the pixel sees (`spot.across` metres across the goal, plus to
// the right, `spot.depth` metres from the camera), or nothing to leave what is there
export function paintGround(raster, surface, { top = Math.round(HORIZON) } = {}) {
  for (let row = Math.max(top, INNER.top); row < ART.height; row += 1) {
    const depth = depthOfRow(row);

    for (let column = 0; column < ART.width; column += 1) {
      const colour = surface({ across: acrossAt(column, depth), depth }, column, row);

      if (colour) {
        raster.pixels[row * raster.width + column] = colour;
      }
    }
  }
}

const rowOfDepth = (depth) => Math.round(project({ x: 0, y: 0, z: depth }).y);

// the goal line under the posts and the line of the goal area nearer the camera, as the night's
// grass draws them: rows of white, the lower one of each in shade
export function lineRows() {
  const six = rowOfDepth(DEPTH.line - 5.5);

  return [
    { row: FRAME.line, shade: false },
    { row: FRAME.line + 1, shade: true },
    { row: six, shade: false },
    { row: six + 1, shade: false },
    { row: six + 2, shade: true },
  ];
}

// `colourOf(column, row, shade)` paints a line's pixel, or nothing where it has worn away
export function paintLines(raster, colourOf) {
  for (const { row, shade } of lineRows()) {
    for (let column = 0; column < raster.width; column += 1) {
      const colour = colourOf(column, row, shade);

      if (colour) {
        raster.pixels[row * raster.width + column] = colour;
      }
    }
  }
}
