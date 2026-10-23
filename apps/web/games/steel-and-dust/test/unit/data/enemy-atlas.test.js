import { describe, expect, it } from 'vitest';
import { ENEMY_ATLAS } from '../../../src/data/enemies/atlas/index.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { readPngAlpha } from '../../support/png-alpha.js';
import { readSheet } from '../../support/sheet-cells.js';

const PACKED = new URL('../../../assets/sprites/enemies/packed/', import.meta.url);
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

function sheetMismatches(id) {
  const { sprite, image: grid } = readSheet(id);
  const packed = readPngAlpha(new URL(sprite.file, PACKED));
  const mismatches = [];
  for (let row = 0; row * sprite.frameHeight < grid.height; row++) {
    for (let frame = 0; frame * sprite.frameWidth < grid.width; frame++) {
      const cell = {
        left: frame * sprite.frameWidth,
        top: row * sprite.frameHeight,
        width: sprite.frameWidth,
        height: sprite.frameHeight,
      };
      const piece = ENEMY_ATLAS[id][row]?.[frame] ?? null;
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

describe('the packed enemy sheets', () => {
  it('have a table of pieces for every enemy sheet', () => {
    expect(Object.keys(ENEMY_ATLAS).sort()).toEqual(Object.keys(ENEMY_SPRITES).sort());
  });

  // a grid sheet changed without running tools/pack_enemy_sheets.py again fails here
  it('hold every frame of the grid sheets pixel for pixel, with only empty space cut away', () => {
    for (const id of Object.keys(ENEMY_SPRITES)) {
      expect(sheetMismatches(id), id).toEqual([]);
    }
  });
});
