import { SILHOUETTE } from '../../art/portraits/base.js';
import { paintShoulders, shoulderTop } from './body.js';
import { GRID_SIZE, cellAt, createGrid, replaceCells, stamp } from './grid.js';
import { paintHead, paintNeck } from './head.js';
import { chinOf } from './head-shapes.js';
import { outlineShape } from './outline.js';
import { SOCHETRA_HAIR } from './hair/sochetra.js';

export const SILHOUETTE_PALETTE = {
  outline: SILHOUETTE.outline,
  cloth: SILHOUETTE.body,
  clothLight: SILHOUETTE.rim,
};

const lit = (grid, x, y) => cellAt(grid, x - 1, y) === null || cellAt(grid, x, y - 1) === null;

// a face the kit does not know comes out as a shape in shadow, never as nothing
export function composeSilhouette() {
  const grid = createGrid();

  paintShoulders(grid, 'broad');
  paintNeck(grid, { half: 6, top: chinOf('young') - 4, bottom: shoulderTop('broad') + 2 });
  paintHead(grid, 'young');
  stamp(grid, SOCHETRA_HAIR.rows, SOCHETRA_HAIR);
  replaceCells(grid, () => true, 'B');

  const rim = grid.cells.flatMap((cell, index) => {
    const x = index % GRID_SIZE;
    const y = Math.floor(index / GRID_SIZE);

    return cell !== null && x < 34 && lit(grid, x, y) ? [index] : [];
  });

  rim.forEach((index) => {
    grid.cells[index] = 'A';
  });
  outlineShape(grid);

  return grid;
}
