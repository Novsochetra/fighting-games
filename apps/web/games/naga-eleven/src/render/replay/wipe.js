import { CINE } from '../../art/cinematics/palette.js';
import { VIEW } from '../../config.js';
import { easeIn, easeOut } from '../cinematics/shared/ease.js';

// the slash's edge leans a pixel every two rows; its leading stripes, gold then red, run ahead of
// the night-blue body that covers the view
const LEAN = 2;
const STRIPES = [
  [10, CINE.gold[3]],
  [8, CINE.gold[2]],
  [4, CINE.ink],
  [16, CINE.replay[2]],
  [6, CINE.replay[1]],
  [4, CINE.ink],
];
const STRIPE_WIDTH = STRIPES.reduce((sum, [width]) => sum + width, 0);
const SLANT = Math.ceil(VIEW.height / LEAN);
const TRAVEL = VIEW.width + SLANT + STRIPE_WIDTH * 2;

function span(context, { from, to, row }, colour) {
  const left = Math.max(0, from);
  const right = Math.min(VIEW.width, to);

  if (right > left) {
    context.fillStyle = colour;
    context.fillRect(left, row, right - left, 1);
  }
}

function drawEdgeRow(context, { edge, row, facing }) {
  let at = edge;

  for (const [width, colour] of STRIPES) {
    const from = facing > 0 ? at : at - width;

    span(context, { from, to: from + width, row }, colour);
    at += facing * width;
  }
}

// `front` is where the slash's edge crosses the top row; `facing` 1 is a slash coming in over the
// view, its body behind the edge, and -1 one going off to the right, its body ahead of it
function drawSlash(context, { front, facing }) {
  for (let row = 0; row < VIEW.height; row += 1) {
    const edge = Math.round(front - row / LEAN);
    const body = facing > 0 ? { from: 0, to: edge } : { from: edge, to: VIEW.width };

    span(context, { ...body, row }, CINE.panel[1]);
    drawEdgeRow(context, { edge, row, facing });
  }
}

// in: the slash sweeps over the view until it is all covered; out: it slides on off the right
export function drawReplayWipe(context, { share, leaving = false }) {
  const covering = leaving ? share <= 0 : share >= 1;

  if (covering) {
    context.fillStyle = CINE.panel[1];
    context.fillRect(0, 0, VIEW.width, VIEW.height);

    return;
  }

  if (leaving ? share >= 1 : share <= 0) {
    return;
  }

  if (leaving) {
    drawSlash(context, { front: easeOut(share) * TRAVEL - STRIPE_WIDTH, facing: -1 });
  } else {
    drawSlash(context, { front: easeIn(share) * (TRAVEL - STRIPE_WIDTH), facing: 1 });
  }
}
