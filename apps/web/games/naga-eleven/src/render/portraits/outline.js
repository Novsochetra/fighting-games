import { GRID_SIZE, cellAt, setCell } from './grid.js';
import { HAIR_LETTERS } from './legend.js';

const LIT_SKIN = new Set(['1', '2']);

const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function touchesShape(grid, x, y) {
  return NEIGHBOURS.some(([dx, dy]) => cellAt(grid, x + dx, y + dy) !== null);
}

export function outlineShape(grid) {
  const edge = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (cellAt(grid, x, y) === null && touchesShape(grid, x, y)) {
        edge.push([x, y]);
      }
    }
  }

  edge.forEach(([x, y]) => setCell(grid, x, y, 'O'));
}

// hair hangs a little above the skin, so the skin just under each lock falls into shade
export function castHairShadow(grid) {
  for (let x = 0; x < GRID_SIZE; x += 1) {
    for (let y = 1; y < GRID_SIZE; y += 1) {
      const above = cellAt(grid, x, y - 1);

      if (HAIR_LETTERS.has(above) && LIT_SKIN.has(cellAt(grid, x, y))) {
        setCell(grid, x, y, '3');
      }
    }
  }
}
