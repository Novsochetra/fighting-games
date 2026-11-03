import { GRID_SIZE, setCell } from '../grid.js';

export function zip({ from }) {
  return (grid) => {
    for (let y = from; y < GRID_SIZE; y += 1) {
      setCell(grid, 31, y, y % 2 === 0 ? 'M' : 'N');
      setCell(grid, 32, y, 'K');
    }
  };
}
