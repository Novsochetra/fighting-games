import { GRID_SIZE, cellAt, setCell } from '../grid.js';

const ON = { B: 'T', A: 'T', C: 'U', D: 'U' };

// a printed blouse: small dots in a diamond lattice, dimmer where the cloth turns from the light
export function dots({ from }) {
  return (grid) => {
    for (let y = from; y < GRID_SIZE; y += 3) {
      for (let x = ((y - from) / 3) % 2 === 0 ? 1 : 4; x < GRID_SIZE; x += 6) {
        const under = cellAt(grid, x, y);

        if (ON[under]) {
          setCell(grid, x, y, ON[under]);
        }
      }
    }
  };
}
