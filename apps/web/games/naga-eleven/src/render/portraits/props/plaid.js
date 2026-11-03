import { GRID_SIZE, cellAt, setCell } from '../grid.js';

const CLOTH = new Set(['A', 'B', 'C', 'D']);

// a flannel shirt's checks: dark bands across and down the cloth, the far side's in shade
export function plaid({ from, every = 7 }) {
  return (grid) => {
    for (let y = from; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const band = x % every < 2 || (y - from) % every === 0;

        if (band && CLOTH.has(cellAt(grid, x, y))) {
          setCell(grid, x, y, x < 32 ? 'T' : 'U');
        }
      }
    }
  };
}
