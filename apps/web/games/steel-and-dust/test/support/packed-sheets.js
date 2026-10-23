import { readPngAlpha } from './png-alpha.js';

// checks a packed sheet (tools/sheet_packing.py) against the grid sheet it was cut from: each
// frame's piece is [x, y, width, height, left, top], where it is and where it sat in its cell
const sameColor = (first, second) => first.every((value, i) => value === second[i]);

// the packed pixel a cell pixel was moved to, or null outside the cell's piece
function packedAt(piece, cellX, cellY) {
  const [sx, sy, width, height, left, top] = piece;
  const inside = cellX >= left && cellX < left + width && cellY >= top && cellY < top + height;
  return inside ? { x: sx + cellX - left, y: sy + cellY - top } : null;
}

function samePixel(grid, packed, from, to) {
  const alpha = packed.alpha(to.x, to.y);
  if (alpha !== grid.alpha(from.x, from.y)) {
    return false;
  }
  return alpha === 0 || sameColor(packed.rgb(to.x, to.y), grid.rgb(from.x, from.y));
}

// every pixel of the cell is in its piece, unchanged, or else clear
function cellMismatches(grid, packed, cell, piece) {
  let wrong = 0;
  for (let y = 0; y < cell.height; y++) {
    for (let x = 0; x < cell.width; x++) {
      const from = { x: cell.left + x, y: cell.top + y };
      const to = piece && packedAt(piece, x, y);
      const fits = to ? samePixel(grid, packed, from, to) : grid.alpha(from.x, from.y) === 0;
      wrong += fits ? 0 : 1;
    }
  }
  return wrong;
}

// the piece's border of clear pixels may stick out past its cell; out there it must stay clear
function borderMismatches(packed, cell, piece) {
  const [sx, sy, width, height, left, top] = piece;
  let wrong = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cellX = left + x;
      const cellY = top + y;
      const outside = cellX < 0 || cellY < 0 || cellX >= cell.width || cellY >= cell.height;
      wrong += outside && packed.alpha(sx + x, sy + y) > 0 ? 1 : 0;
    }
  }
  return wrong;
}

// every cell of the grid sheet, as `row r frame f: n pixels` for each that the packed sheet does
// not hold pixel for pixel
export function packedMismatches({ gridPath, packedPath, frameWidth, frameHeight, rows }) {
  const grid = readPngAlpha(gridPath);
  const packed = readPngAlpha(packedPath);
  const mismatches = [];
  for (let row = 0; row * frameHeight < grid.height; row++) {
    for (let frame = 0; frame * frameWidth < grid.width; frame++) {
      const cell = {
        left: frame * frameWidth,
        top: row * frameHeight,
        width: frameWidth,
        height: frameHeight,
      };
      const piece = rows[row]?.[frame] ?? null;
      const wrong =
        cellMismatches(grid, packed, cell, piece) +
        (piece ? borderMismatches(packed, cell, piece) : 0);
      if (wrong) {
        mismatches.push(`row ${row} frame ${frame}: ${wrong} pixels`);
      }
    }
  }
  return mismatches;
}
