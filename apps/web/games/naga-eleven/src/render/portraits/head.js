import { fillRow, setCell, stamp, mirrorX } from './grid.js';
import { CROWN_Y, HEAD_SHAPES, halfWidthAt } from './head-shapes.js';

const EAR = ['.2.', '212', '132', '142', '142', '132', '22.', '.2.'];

const SHADED = { 1: '2', 2: '3', 3: '4', 4: '4' };

const shadeRows = (rows) => rows.map((row) => row.replace(/[1-4]/g, (letter) => SHADED[letter]));

// light from the top left: the far side's shade widens from the brow down the cheek to the jaw
function bandFor({ index, half, next }) {
  if (next < half) {
    return 4;
  }

  return index < 12 ? 2 : 3;
}

function paintHeadRow(grid, { y, index, half, next }) {
  const left = 32 - half;
  const right = 31 + half;
  const band = bandFor({ index, half, next });

  fillRow(grid, { y, from: left, to: right, letter: '2' });
  fillRow(grid, { y, from: right - band + 1, to: right, letter: '3' });
  setCell(grid, left - 1, y, 'O');
  setCell(grid, right + 1, y, 'O');

  if (next < half) {
    setCell(grid, right, y, '4');
  }

  for (let x = left; x <= right; x += 1) {
    if (x < 32 - next || x > 31 + next) {
      setCell(grid, x, y + 1, 'O');
    }
  }
}

function paintChin(grid, { y, half }) {
  fillRow(grid, { y, from: 33 - half, to: 31 + half, letter: '3' });
  fillRow(grid, { y: y - 1, from: 36 - half, to: 31 + half, letter: '3' });
}

export function paintHead(grid, shape) {
  const rows = HEAD_SHAPES[shape];

  rows.forEach((half, index) => {
    paintHeadRow(grid, { y: CROWN_Y + index, index, half, next: rows[index + 1] ?? 0 });
  });
  paintChin(grid, { y: CROWN_Y + rows.length - 1, half: rows.at(-1) });
}

export function paintCheek(grid, { shape, y }) {
  const left = 32 - halfWidthAt(shape, y);

  fillRow(grid, { y, from: left + 2, to: left + 3, letter: '1' });
}

export function paintEars(grid, { shape, y }) {
  const left = 32 - halfWidthAt(shape, y) - 3;

  stamp(grid, EAR, { x: left, y });
  stamp(grid, shadeRows(EAR), { x: mirrorX(left + 2), y, mirror: true });
}

// under the chin the neck sits in the head's shadow; its far side turns from the light
export function paintNeck(grid, { half, top, bottom }) {
  for (let y = top; y <= bottom; y += 1) {
    const inShadow = y < top + 6;

    fillRow(grid, { y, from: 32 - half, to: 31 + half, letter: inShadow ? '3' : '2' });
    fillRow(grid, { y, from: 32 + Math.floor(half / 3), to: 31 + half, letter: '3' });
    fillRow(grid, { y, from: 31 + half, to: 31 + half, letter: '4' });
  }
}
