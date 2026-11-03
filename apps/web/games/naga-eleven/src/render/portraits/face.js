import { stamp } from './grid.js';
import { paintBrows } from './brows.js';
import { eyeBox, paintEyes } from './eyes.js';
import { paintCheek, paintEars, paintHead } from './head.js';
import { halfWidthAt } from './head-shapes.js';
import { mouthFor, paintMouth } from './mouths.js';
import { paintNose } from './noses.js';
import { castHairShadow } from './outline.js';
import { paintTouches } from './touches.js';

const runAll = (painters, grid, mood) => (painters ?? []).forEach((paint) => paint(grid, mood));

function faceBox(recipe, eyes) {
  const half = halfWidthAt(recipe.head, eyes.bottom + 2);

  return { left: 32 - half, right: 31 + half };
}

function paintFeatures(grid, recipe, mood) {
  const { eyes, nose, mouth } = recipe;

  paintNose(grid, nose);
  paintMouth(grid, { name: mouthFor(mood, mouth.moods), y: mouth.y });
  paintEyes(grid, { ...eyes, mood });
}

export function paintFace(grid, recipe, mood) {
  const eyes = eyeBox(recipe.eyes);

  paintHead(grid, recipe.head);
  paintEars(grid, { shape: recipe.head, y: recipe.ears });
  paintCheek(grid, { shape: recipe.head, y: eyes.bottom + 2 });
  runAll(recipe.skinDetails, grid, mood);
  paintFeatures(grid, recipe, mood);

  if (recipe.hair) {
    stamp(grid, recipe.hair.rows, recipe.hair);
  }

  castHairShadow(grid);
  paintBrows(grid, { ...recipe.brows, mood });
  runAll(recipe.faceProps, grid, mood);
  paintTouches(grid, { mood, eyes, face: faceBox(recipe, eyes) });
}
