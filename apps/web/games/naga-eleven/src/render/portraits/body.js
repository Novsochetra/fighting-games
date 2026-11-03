import { GRID_SIZE, cellAt, fillRow, setCell } from './grid.js';

// half-widths row by row from the top of the shoulders down to the frame's bottom edge
export const SHOULDERS = {
  child: { top: 50, rows: [8, 12, 15, 17, 18, 19, 20, 20, 21, 21, 21, 22, 22, 22] },
  teen: { top: 50, rows: [9, 14, 18, 21, 23, 24, 25, 25, 26, 26, 26, 27, 27, 27] },
  broad: { top: 48, rows: [11, 17, 21, 24, 26, 27, 28, 28, 29, 29, 29, 30, 30, 30, 30, 30] },
  woman: { top: 48, rows: [9, 13, 17, 20, 21, 22, 23, 23, 24, 24, 24, 25, 25, 25, 25, 25] },
  big: { top: 48, rows: [11, 17, 22, 25, 27, 28, 29, 30, 30, 31, 31, 31, 31, 31, 31, 31] },
};

const CLOTH = new Set(['A', 'B', 'C', 'D']);

function shadeColumn(grid, x) {
  let y = 0;

  while (y < GRID_SIZE && !CLOTH.has(cellAt(grid, x, y))) {
    y += 1;
  }

  setCell(grid, x, y, x < 32 ? 'A' : 'B');

  if (x < 26) {
    setCell(grid, x, y + 1, 'A');
  }
}

// the upper arm turns away from the chest, so a fold of shade marks where each arm begins
function paintArmFolds(grid, { top, bottomHalf }) {
  const left = 32 - bottomHalf + 6;
  const right = 31 + bottomHalf - 6;

  for (let y = top + 6; y < GRID_SIZE; y += 1) {
    setCell(grid, left, y, 'C');
    setCell(grid, right, y, 'D');
    setCell(grid, right - 1, y, 'C');
  }
}

export function paintShoulders(grid, build) {
  const { top, rows } = SHOULDERS[build];
  const last = rows.at(-1);

  for (let y = top; y < GRID_SIZE; y += 1) {
    const half = rows[Math.min(y - top, rows.length - 1)];

    fillRow(grid, { y, from: 32 - half, to: 31 + half, letter: 'B' });
    fillRow(grid, { y, from: 28 + half, to: 31 + half, letter: 'C' });
    setCell(grid, 31 + half, y, 'D');
  }

  for (let x = 32 - last; x <= 31 + last; x += 1) {
    shadeColumn(grid, x);
  }

  paintArmFolds(grid, { top, bottomHalf: last });
}

export function shoulderTop(build) {
  return SHOULDERS[build].top;
}
