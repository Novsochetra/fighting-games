import { GOAL } from '../../../art/training/ground.js';
import { faded, line, paint } from '../pixels.js';
import { toScreen } from './view.js';

// a youth goal standing across the lane's end, its mouth toward the runner and its net behind:
// a little taller than the boy (58 px) and about 1.7 times his height wide, its net sloping back
// to a lower bar
export const GOAL_BOX = { far: 50, near: 150, depth: 36, height: 66, back: 50 };

const MESH = 8;

const up = (point, height) => ({ x: point.x, y: point.y - height });

function cornersOf(camera, goalX) {
  return {
    frontFar: toScreen(camera, goalX, GOAL_BOX.far),
    frontNear: toScreen(camera, goalX, GOAL_BOX.near),
    backFar: toScreen(camera, goalX + GOAL_BOX.depth, GOAL_BOX.far),
    backNear: toScreen(camera, goalX + GOAL_BOX.depth, GOAL_BOX.near),
  };
}

// the net's mesh: lines across each panel at even steps
function mesh(context, [start, end], [startTo, endTo]) {
  for (let i = 0; i <= MESH; i += 1) {
    const share = i / MESH;
    const from = { x: start.x + (end.x - start.x) * share, y: start.y + (end.y - start.y) * share };
    const to = {
      x: startTo.x + (endTo.x - startTo.x) * share,
      y: startTo.y + (endTo.y - startTo.y) * share,
    };

    line(context, GOAL.net, [from, to]);
  }
}

function panel(context, [bottomA, bottomB], height) {
  mesh(context, [bottomA, bottomB], [up(bottomA, height), up(bottomB, height)]);
  mesh(context, [bottomA, up(bottomA, height)], [bottomB, up(bottomB, height)]);
}

// a side panel: the front post's full height, sloping down to the back bar
function sidePanel(context, [front, back]) {
  const { height, back: low } = GOAL_BOX;

  mesh(context, [front, back], [up(front, height), up(back, low)]);
  mesh(context, [front, up(front, height)], [back, up(back, low)]);
}

export function drawGoalBack(context, { camera, goalX }) {
  const box = cornersOf(camera, goalX);
  const { height, back } = GOAL_BOX;

  faded(context, 0.55, () => {
    panel(context, [box.backFar, box.backNear], back);
    sidePanel(context, [box.frontFar, box.backFar]);
    mesh(
      context,
      [up(box.frontFar, height), up(box.backFar, back)],
      [up(box.frontNear, height), up(box.backNear, back)],
    );
  });
  paint(context, GOAL.postShade, [box.backFar.x, box.backFar.y - back, 1, back]);
  paint(context, GOAL.postShade, [box.backNear.x, box.backNear.y - back, 1, back]);
  line(context, GOAL.postShade, [up(box.backFar, back), up(box.backNear, back)]);
}

export function drawGoalFront(context, { camera, goalX }) {
  const box = cornersOf(camera, goalX);
  const height = GOAL_BOX.height;

  faded(context, 0.55, () => sidePanel(context, [box.frontNear, box.backNear]));

  for (const post of [box.frontFar, box.frontNear]) {
    paint(context, GOAL.postShade, [post.x, post.y - height, 3, height]);
    paint(context, GOAL.post, [post.x, post.y - height, 2, height]);
  }

  line(context, GOAL.postShade, [up(box.frontFar, height - 1), up(box.frontNear, height - 1)]);
  line(context, GOAL.post, [up(box.frontFar, height), up(box.frontNear, height)]);
  line(context, GOAL.post, [up(box.frontFar, height + 1), up(box.frontNear, height + 1)]);
}

// where a ball struck into the net comes to rest
export const netSpot = (goalX) => ({ x: goalX + GOAL_BOX.depth - 8, y: 96 });
