import { setCell, stamp } from '../grid.js';

const WHISTLE = ['.OOOO.', 'OMMNNO', 'ONNKKO', '.OOOO.'];

export function whistle({ top, neckHalf, hangsTo }) {
  return (grid) => {
    for (let y = top; y < hangsTo; y += 1) {
      const step = Math.round(((y - top) * (neckHalf - 2)) / (hangsTo - top));

      setCell(grid, 32 - neckHalf + 1 + step, y, 'F');
      setCell(grid, 31 + neckHalf - 1 - step, y, 'G');
    }

    stamp(grid, WHISTLE, { x: 29, y: hangsTo });
  };
}
