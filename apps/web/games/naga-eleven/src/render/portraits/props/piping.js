import { GRID_SIZE, cellAt, setCell } from '../grid.js';

const CLOTH = new Set(['A', 'B', 'C', 'D']);

// a national kit's raglan seams: a white line edged in blue from the collar out over each
// shoulder, the far one turned from the light
function seamAt(grid, { x, y, near }) {
  const [white, blue] = near ? ['E', 'F'] : ['W', 'G'];
  const outward = near ? -1 : 1;

  if (CLOTH.has(cellAt(grid, x, y))) {
    setCell(grid, x, y, white);
  }

  if (CLOTH.has(cellAt(grid, x - outward, y))) {
    setCell(grid, x - outward, y, blue);
  }
}

export function piping({ top, from, to }) {
  return (grid) => {
    for (let y = top; y < GRID_SIZE; y += 1) {
      const along = ((y - top) / (GRID_SIZE - 1 - top)) ** 0.5;
      const x = Math.round(from + (to - from) * along);

      seamAt(grid, { x: 31 - x, y, near: true });
      seamAt(grid, { x: 32 + x, y, near: false });
    }
  };
}
