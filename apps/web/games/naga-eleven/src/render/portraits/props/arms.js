import { paintPatch } from './patch.js';

const HAND = ['.11111.', '1122223', '1222223', '2323233', '2323233', '2323233', '.33333.'];

// the far arm sits in the near arm's shadow, so its lowest rows are the darkest
const SHADES = {
  far: ['A', 'B', 'B', 'C', 'D', 'D'],
  near: ['A', 'A', 'B', 'B', 'B', 'C', 'C', 'D'],
};

function sleeveCells({ x, y, width, rows }) {
  return Array.from({ length: rows * width }, (_, i) => [
    x + (i % width),
    y + Math.floor(i / width),
  ]).filter(([cellX, cellY]) => {
    const fromEnd = Math.min(cellX - x, x + width - 1 - cellX);
    const fromEdge = Math.min(cellY - y, y + rows - 1 - cellY);

    return fromEnd + fromEdge > 0;
  });
}

function paintSleeve(grid, { x, y, width, shade, cuff }) {
  const rows = SHADES[shade];
  const inCuff = (cellX) => cellX >= cuff && cellX <= cuff + 1;

  paintPatch(grid, sleeveCells({ x, y, width, rows: rows.length }), (cellX, cellY) =>
    inCuff(cellX) ? 'T' : rows[cellY - y],
  );
}

function paintHand(grid, { x, y }) {
  const cells = HAND.flatMap((row, dy) =>
    [...row].flatMap((letter, dx) => (letter === '.' ? [] : [[x + dx, y + dy]])),
  );

  paintPatch(grid, cells, (cellX, cellY) => HAND[cellY - y][cellX - x]);
}

export function foldedArms() {
  return (grid) => {
    paintSleeve(grid, { x: 10, y: 51, width: 40, shade: 'far', cuff: 44 });
    paintHand(grid, { x: 46, y: 50 });
    paintSleeve(grid, { x: 13, y: 56, width: 44, shade: 'near', cuff: 14 });
    paintHand(grid, { x: 8, y: 54 });
  };
}
