import { drawPropSprite } from '../scene/props/prop-sprites.js';

// reaches past anything on the road, above or below, so a cut along a door's dark holds the hero
const FAR = 2000;
const UNSEEN = new Set(['wait', 'gone']);

// what of the hero shows in a doorway: in front of a door, all of it but what has gone into its
// dark, on the near side going in and on the far side coming out; at a fence, only what is in
// its opening
function shownPart({ way, doorway }) {
  if (!doorway.dark) {
    return doorway.opening;
  }

  const from = way === 'out' ? doorway.left - FAR : doorway.right;

  return { x: from, y: -FAR, width: FAR, height: FAR * 2 };
}

export function drawInDoorway(painter, { game, fighter }, draw) {
  const run = game.gateRun;

  if (fighter !== game.player || !run?.inDoorway) {
    draw();
    return;
  }

  if (UNSEEN.has(run.phase)) {
    return;
  }

  const { x, y, width, height } = shownPart(run);
  const { context } = painter;

  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  draw();
  context.restore();
}

// a hero walking through a fence's opening is behind the fence, so the fence is drawn again over
// it; at a door the hero walks in front of the wall, into its dark
export function drawWallOverHero(painter, { game, sheets }) {
  const run = game.gateRun;

  if (run?.inDoorway && !run.doorway.dark) {
    drawPropSprite(painter, sheets, run.doorway.wall);
  }
}
