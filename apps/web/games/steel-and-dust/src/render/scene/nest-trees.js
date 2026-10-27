import { VIEW_WIDTH } from '../../config.js';
import { NEST } from '../../data/nests.js';
import { drawFxFrame } from '../fx/fx-sheets.js';
import { hangingAt } from './nests.js';

// where a nest meets its tree, from the point it hangs at (the nest art's own pixels, which it
// draws at half the world's): the thick end of its branch, or, in a tree it hangs in by its rope
// alone, the top of that rope
const BRANCH_FOOT = { x: -16, y: -22 };
const ROPE_TOP = { x: -4, y: -30 };
// the tree is drawn a little down into the road's grass, so its roots sit in it
const SET_IN = 3;

const footOf = (tree) => (tree.branch === undefined ? ROPE_TOP : BRANCH_FOOT);

// the tree a nest hangs from is one of the forest's own, cut from its near layer and stood on the
// road, so the nest's branch grows out of a trunk that scrolls with the road under it
export function nestTreeAt(nest, tree) {
  const left = nest.x + footOf(tree).x - (tree.bough - tree.from);

  return { left, top: nest.y + SET_IN - tree.base, width: tree.to - tree.from };
}

// the row of the tree where the nest's branch, or its rope, meets it
export const boughRow = (tree) => tree.base - SET_IN - NEST.hang + footOf(tree).y;

function nearLayer(backdrop, tree) {
  return backdrop.layers.find((layer) => layer.name === tree.layer);
}

// the tree with the branch the nest hangs by, which stays on it once the nest has torn loose
function drawTree(painter, sheets, { nest, tree, image }) {
  const { left, top, width } = nestTreeAt(nest, tree);
  const { from, base } = tree;

  painter.context.drawImage(image, from, 0, width, base, left, top, width, base);
  if (tree.branch === undefined) {
    return;
  }

  drawFxFrame(painter, sheets, {
    name: 'nestBranch',
    frame: tree.branch,
    x: nest.x,
    y: hangingAt(nest),
  });
}

export function drawNestTrees(painter, sheets, { nests, backdrop, cameraX }) {
  const tree = backdrop?.nestTree;
  const layer = tree && nearLayer(backdrop, tree);

  if (!layer?.ready) {
    return;
  }

  for (const nest of nests) {
    const { left, width } = nestTreeAt(nest, tree);

    if (left + width > cameraX && left < cameraX + VIEW_WIDTH) {
      drawTree(painter, sheets, { nest, tree, image: layer.image });
    }
  }
}
