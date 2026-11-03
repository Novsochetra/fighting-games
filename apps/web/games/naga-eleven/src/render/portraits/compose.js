import { paintShoulders, shoulderTop } from './body.js';
import { NECK_BELOW, paintCollar } from './collars.js';
import { paintFace } from './face.js';
import { createGrid, overlay, stamp } from './grid.js';
import { paintNeck } from './head.js';
import { chinOf } from './head-shapes.js';
import { outlineShape } from './outline.js';

const runAll = (painters, grid, mood) => (painters ?? []).forEach((paint) => paint(grid, mood));

function paintBody(grid, recipe, mood) {
  const top = shoulderTop(recipe.build);
  const lift = recipe.lift ?? 0;

  paintShoulders(grid, recipe.build);
  paintNeck(grid, {
    half: recipe.neck,
    top: chinOf(recipe.head) + lift - 4,
    bottom: top + NECK_BELOW,
  });
  paintCollar(grid, { kind: recipe.collar, top, neckHalf: recipe.neck });
  runAll(recipe.chestProps, grid, mood);
}

// the head is drawn on its own grid so a smaller person's whole head can sit lower in the frame
export function composePortrait(recipe, mood) {
  const grid = createGrid();
  const head = createGrid();
  const lift = recipe.lift ?? 0;

  if (recipe.backHair) {
    const back = createGrid();

    stamp(back, recipe.backHair.rows, recipe.backHair);
    overlay(grid, back, { dy: lift });
  }

  paintBody(grid, recipe, mood);
  paintFace(head, recipe, mood);
  overlay(grid, head, { dy: lift });
  runAll(recipe.frontProps, grid, mood);
  outlineShape(grid);

  return grid;
}
