import { VIEW_WIDTH } from '../../config.js';
import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { NEST } from '../../data/nests.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 48;
const FRAMES = { hanging: 0, struck: 1, falling: 2, broken: 3 };
// the branch as the blow left it, knocked askew: in the struck frame's own pixels, the rows over
// the nest and the thick end of the bough reaching down beside it
const ASKEW = 1;
const BRANCH = [
  [0, 0, 89, 22],
  [50, 22, 39, 10],
];
const { anchorX, anchorY } = FX_SPRITES.hornetNest;

export function nestFrame(nest) {
  return FRAMES[nest.state];
}

// a struck nest trembles on its branch before it tears loose
export function tremble(nest) {
  return nest.state === 'struck' ? ((nest.time >> 1) % 2) * 2 - 1 : 0;
}

export const inView = (nest, cameraX) =>
  nest.x > cameraX - MARGIN && nest.x < cameraX + VIEW_WIDTH + MARGIN;

export const hangingAt = (nest) => nest.y - NEST.hang;

// the branch stays up where the nest hung once it has torn loose and fallen
function drawBranch(painter, sheets, nest) {
  const y = hangingAt(nest);
  const context = painter.context;

  context.save();
  context.beginPath();
  for (const [left, top, width, height] of BRANCH) {
    context.rect(
      nest.x + (left - anchorX) * FX_SCALE,
      y + (top - anchorY) * FX_SCALE,
      width * FX_SCALE,
      height * FX_SCALE,
    );
  }

  context.clip();
  drawFxFrame(painter, sheets, { name: 'hornetNest', frame: ASKEW, x: nest.x, y });
  context.restore();
}

function drawNest(painter, sheets, nest) {
  const torn = nest.state === 'falling' || nest.state === 'broken';
  const x = nest.x + tremble(nest);
  const y = hangingAt(nest) + nest.drop;

  if (torn) {
    drawBranch(painter, sheets, nest);
  }

  drawFxFrame(painter, sheets, { name: 'hornetNest', frame: nestFrame(nest), x, y });
}

export function drawNests(painter, sheets, { nests, cameraX }) {
  for (const nest of nests) {
    if (inView(nest, cameraX)) {
      drawNest(painter, sheets, nest);
    }
  }
}
