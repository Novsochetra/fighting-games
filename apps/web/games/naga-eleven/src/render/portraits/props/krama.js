import { GRID_SIZE, mirrorX } from '../grid.js';
import { paintPatch, spanCells } from './patch.js';

// the krama's checks are two pixels square; on the far side they turn from the light
function checkAt(x, y) {
  const red = (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0;

  if (x >= 32) {
    return red ? 'G' : 'W';
  }

  return red ? 'F' : 'E';
}

// draped round the back of the neck, its two ends hang down the chest
export function krama({ top, neckHalf }) {
  const spans = Array.from({ length: GRID_SIZE - (top - 3) }, (_, i) => {
    const y = top - 3 + i;
    const inward = Math.min(3, Math.floor(i / 3));
    const outer = 32 - neckHalf - 5 + inward;

    return [
      [y, outer, outer + 6],
      [y, mirrorX(outer + 6), mirrorX(outer)],
    ];
  }).flat();

  return (grid) => paintPatch(grid, spanCells(spans), checkAt);
}
