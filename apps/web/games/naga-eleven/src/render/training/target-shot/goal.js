import { GOAL, METAL } from '../../../art/training/ground.js';
import { faded, line, paint } from '../pixels.js';
import { MOUTH_ART } from './view.js';

// the frame face on and the net running back from it, its back a little smaller and higher
const FRAME = { left: 72, right: 312, top: 44, post: 3 };
const BACK = { left: 84, right: 300, top: 54, bottom: 116 };
const MESH = 6;

function drawBackNet(context) {
  faded(context, 0.18, () =>
    paint(context, GOAL.netShade, [
      BACK.left,
      BACK.top,
      BACK.right - BACK.left,
      BACK.bottom - BACK.top,
    ]),
  );
  faded(context, 0.6, () => {
    for (let x = BACK.left; x <= BACK.right; x += MESH) {
      paint(context, GOAL.net, [x, BACK.top, 1, BACK.bottom - BACK.top]);
    }

    for (let y = BACK.top; y <= BACK.bottom; y += MESH) {
      paint(context, GOAL.net, [BACK.left, y, BACK.right - BACK.left, 1]);
    }
  });
}

// the roof and the side nets: lines from the frame back to the net's back
function drawSideNets(context) {
  faded(context, 0.5, () => {
    for (let x = FRAME.left; x <= FRAME.right; x += MESH * 2) {
      const back =
        BACK.left + ((x - FRAME.left) * (BACK.right - BACK.left)) / (FRAME.right - FRAME.left);

      line(context, GOAL.net, [
        { x, y: FRAME.top + 1 },
        { x: Math.round(back), y: BACK.top },
      ]);
    }

    for (let y = FRAME.top; y <= MOUTH_ART.ground; y += MESH) {
      const back =
        BACK.top + ((y - FRAME.top) * (BACK.bottom - BACK.top)) / (MOUTH_ART.ground - FRAME.top);

      line(context, GOAL.net, [
        { x: FRAME.left + 1, y },
        { x: BACK.left, y: Math.round(back) },
      ]);
      line(context, GOAL.net, [
        { x: FRAME.right - 1, y },
        { x: BACK.right, y: Math.round(back) },
      ]);
    }
  });
}

function drawFrame(context) {
  const height = MOUTH_ART.ground - FRAME.top;

  for (const x of [FRAME.left - FRAME.post + 1, FRAME.right]) {
    paint(context, GOAL.post, [x, FRAME.top, FRAME.post, height]);
    paint(context, GOAL.postShade, [
      x + FRAME.post - 1,
      FRAME.top + FRAME.post,
      1,
      height - FRAME.post,
    ]);
  }

  paint(context, GOAL.post, [
    FRAME.left - FRAME.post + 1,
    FRAME.top,
    FRAME.right - FRAME.left + FRAME.post * 2 - 1,
    FRAME.post,
  ]);
  paint(context, GOAL.postShade, [
    FRAME.left,
    FRAME.top + FRAME.post - 1,
    FRAME.right - FRAME.left,
    1,
  ]);
}

export function drawGoal(context) {
  drawBackNet(context);
  drawSideNets(context);
  drawFrame(context);
}

// the keeper dummy runs on a rail laid along the goal line
export function drawRail(context) {
  paint(context, METAL[0], [
    FRAME.left + 6,
    MOUTH_ART.ground - 1,
    FRAME.right - FRAME.left - 12,
    3,
  ]);
  paint(context, METAL[2], [
    FRAME.left + 6,
    MOUTH_ART.ground - 1,
    FRAME.right - FRAME.left - 12,
    1,
  ]);
}

export const GOAL_FRAME = FRAME;
