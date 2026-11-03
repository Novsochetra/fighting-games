export const GRID_SIZE = 64;

export const CLEAR = 'x';

const SKIPPED = new Set(['.', ' ']);

export function createGrid() {
  return { size: GRID_SIZE, cells: new Array(GRID_SIZE * GRID_SIZE).fill(null) };
}

export function inside(x, y) {
  return x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE;
}

export function cellAt(grid, x, y) {
  return inside(x, y) ? grid.cells[y * GRID_SIZE + x] : null;
}

export function setCell(grid, x, y, letter) {
  if (inside(x, y)) {
    grid.cells[y * GRID_SIZE + x] = letter === CLEAR ? null : letter;
  }
}

export function fillRow(grid, { y, from, to, letter }) {
  for (let x = from; x <= to; x += 1) {
    setCell(grid, x, y, letter);
  }
}

export function fillBox(grid, { x, y, width, height, letter }) {
  for (let row = y; row < y + height; row += 1) {
    fillRow(grid, { y: row, from: x, to: x + width - 1, letter });
  }
}

// a pixel map is rows of letters; `.` leaves the cell as it was and `x` clears it
export function stamp(grid, rows, { x, y, mirror = false }) {
  rows.forEach((row, rowIndex) => {
    [...row].forEach((letter, column) => {
      const across = mirror ? row.length - 1 - column : column;

      if (!SKIPPED.has(letter)) {
        setCell(grid, x + across, y + rowIndex, letter);
      }
    });
  });
}

export function mirrorX(x) {
  return GRID_SIZE - 1 - x;
}

export function stampBothSides(grid, rows, { x, y }) {
  const width = Math.max(...rows.map((row) => row.length));

  stamp(grid, rows, { x, y });
  stamp(
    grid,
    rows.map((row) => row.padEnd(width, '.')),
    { x: mirrorX(x + width - 1), y, mirror: true },
  );
}

export function replaceCells(grid, test, letter) {
  grid.cells.forEach((cell, index) => {
    if (cell !== null && test(cell, index % GRID_SIZE, Math.floor(index / GRID_SIZE))) {
      grid.cells[index] = letter;
    }
  });
}

export function overlay(target, source, { dy = 0 } = {}) {
  source.cells.forEach((cell, index) => {
    if (cell !== null) {
      setCell(target, index % GRID_SIZE, Math.floor(index / GRID_SIZE) + dy, cell);
    }
  });
}
