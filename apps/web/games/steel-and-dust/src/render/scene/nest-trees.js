import { VIEW_WIDTH } from '../../config.js';
import { NEST } from '../../data/nests.js';

// where the thick end of a nest's branch meets its tree, from the point the nest hangs at: the
// branch's own pixels in the nest art, which is drawn at half the world's
const BRANCH_FOOT = { x: -16, y: -22 };
// the tree is drawn a little down into the road's grass, so its roots sit in it
const SET_IN = 3;

// the tree a nest hangs from is one of the forest's own, cut from its near layer and stood on the
// road, so the nest's branch grows out of a trunk that scrolls with the road under it
export function nestTreeAt(nest, tree) {
  const left = nest.x + BRANCH_FOOT.x - (tree.bough - tree.from);

  return { left, top: nest.y + SET_IN - tree.base, width: tree.to - tree.from };
}

// the row of the tree the branch grows from: where its foot meets the trunk
export const boughRow = (tree) => tree.base - SET_IN - NEST.hang + BRANCH_FOOT.y;

function nearLayer(backdrop, tree) {
  return backdrop.layers.find((layer) => layer.name === tree.layer);
}

export function drawNestTrees(painter, { nests, backdrop, cameraX }) {
  const tree = backdrop?.nestTree;
  const layer = tree && nearLayer(backdrop, tree);

  if (!layer?.ready) {
    return;
  }

  const { from, base } = tree;

  for (const nest of nests) {
    const { left, top, width } = nestTreeAt(nest, tree);

    if (left + width > cameraX && left < cameraX + VIEW_WIDTH) {
      painter.context.drawImage(layer.image, from, 0, width, base, left, top, width, base);
    }
  }
}
