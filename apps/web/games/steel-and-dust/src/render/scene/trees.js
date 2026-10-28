import { VIEW_WIDTH } from '../../config.js';
import { TREE } from '../../data/trees.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

// the tree art is drawn at twice the sprites' density, as tall as the trunk a blow can reach
const TREE_SCALE = 2;
const MARGIN = TREE.reach + 8;
const FRAMES = { standing: 0, creaking: 1, falling: 2, fallen: 3 };
// it rocks between standing and leaning as it creaks, faster as it gives way
const ROCK_UNTIL = TREE.creak - 6;
// the tree is drawn a little down into the road's grass, as the fighters' feet are, so its stump
// and its felled trunk lie in it rather than on its top edge
const SET_IN = 4;

export function treeFrame(tree) {
  if (tree.state === 'creaking' && tree.time < ROCK_UNTIL) {
    return Math.floor(tree.time / 3) % 2;
  }

  return FRAMES[tree.state];
}

export function drawTrees(painter, sheets, { trees, cameraX }) {
  for (const tree of trees) {
    if (tree.x > cameraX - MARGIN && tree.x < cameraX + VIEW_WIDTH + MARGIN) {
      const { x, y, direction: facing } = tree;
      const frame = treeFrame(tree);

      drawFxFrame(painter, sheets, {
        name: 'deadTree',
        frame,
        x,
        y: y + SET_IN,
        scale: TREE_SCALE,
        facing,
      });
    }
  }
}
