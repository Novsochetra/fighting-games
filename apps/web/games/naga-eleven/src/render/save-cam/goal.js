import { DUEL_INK } from '../../art/duel/palette.js';
import { SAVE_CAM_ART } from '../../art/save-cam.js';
import { hash } from '../duel/hash.js';
import { band } from '../duel/shapes.js';
import { drawBambooFrame } from './backdrops/bamboo-frame.js';
import { DEPTH, FRAME, GOAL_SIZE, project } from './view.js';

// The venue's own goal from in front (README "Keeper skills and the save cam"): `style` gives its
// posts and net ramps, deep to light, and whether it is the village's bamboo, whose old net hangs
// slack on a wider mesh with a string gone here and there, its back lower and sagging
const FLOODLIT = { post: SAVE_CAM_ART.post, net: SAVE_CAM_ART.net, bamboo: false };

const shapeOf = (style) =>
  style.bamboo
    ? { mesh: 6, drop: 0.72, sag: 3, gaps: 0.1 }
    : { mesh: 4, drop: 0.9, sag: 0, gaps: 0 };

function backOf(shape) {
  const topLeft = project({
    x: -GOAL_SIZE.halfWidth,
    y: GOAL_SIZE.height * shape.drop,
    z: DEPTH.net,
  });
  const bottomRight = project({ x: GOAL_SIZE.halfWidth, y: 0, z: DEPTH.net });

  return {
    left: Math.round(topLeft.x),
    top: Math.round(topLeft.y),
    right: Math.round(bottomRight.x),
    bottom: Math.round(bottomRight.y),
  };
}

// how far the slack net hangs below its line at a column, the most in the middle
const sagAt = (back, shape, x) =>
  Math.round(shape.sag * Math.sin((Math.PI * (x - back.left)) / (back.right - back.left)));

// a point of the back of the net pushed in toward where the ball struck it, the nearer the more
function pushed(x, y, bulge) {
  const dx = bulge.x - x;
  const dy = bulge.y - y;
  const pull = bulge.depth * Math.max(0, 1 - Math.hypot(dx, dy) / 26);

  return { x: Math.round(x + dx * pull), y: Math.round(y + dy * pull) };
}

// the ball pushes in only the strings that pass within reach of it
const REACH = 26;

const touched = (bulge, { from, to }) =>
  Boolean(bulge) &&
  (from.x === to.x ? Math.abs(bulge.x - from.x) : Math.abs(bulge.y - from.y)) < REACH;

// one string of the net's back from `from` to `to`, upright or across: one run where it hangs
// still, a dot at a time where the ball pushes it in
function string(pen, { from, to, bulge, colour }) {
  if (!touched(bulge, { from, to })) {
    pen.rect([from.x, from.y, to.x - from.x + 1, to.y - from.y + 1], colour);

    return;
  }

  const upright = from.x === to.x;

  for (let along = upright ? from.y : from.x; along <= (upright ? to.y : to.x); along += 1) {
    const at = upright ? pushed(from.x, along, bulge) : pushed(along, from.y, bulge);

    pen.dot(at.x, at.y, colour);
  }
}

// a string gone from the old net, the same ones every frame
const gone = (shape, i, j) => shape.gaps > 0 && hash(i, j, 77) < shape.gaps;

function verticals(pen, { back, shape, bulge, net }) {
  for (let x = back.left, i = 0; x <= back.right; x += shape.mesh, i += 1) {
    const top = back.top + sagAt(back, shape, x);

    if (!gone(shape, i, 0)) {
      string(pen, { from: { x, y: top }, to: { x, y: back.bottom }, bulge, colour: net[0] });
    }
  }
}

// a horizontal string in flat runs between the columns where its sag steps down a pixel
function horizontal(pen, { back, shape, bulge, net, y, j }) {
  const slack = (back.bottom - y) / Math.max(1, back.bottom - back.top);
  let start = back.left;

  for (let x = back.left + 1; x <= back.right + 1; x += 1) {
    const drop = Math.round(sagAt(back, shape, start) * slack);
    const ends = x > back.right || Math.round(sagAt(back, shape, x) * slack) !== drop;

    if (ends && !gone(shape, Math.floor(start / shape.mesh), j)) {
      string(pen, {
        from: { x: start, y: y + drop },
        to: { x: x - 1, y: y + drop },
        bulge,
        colour: net[1],
      });
    }

    start = ends ? x : start;
  }
}

function backPanel(pen, job) {
  verticals(pen, job);

  for (let y = job.back.top, j = 1; y <= job.back.bottom; y += job.shape.mesh, j += 1) {
    horizontal(pen, { ...job, y, j });
  }
}

// the side and the roof of the net, strung from the frame back to the net's back
function sides(pen, { back, shape, net }) {
  for (let share = 0; share <= 1.001; share += 0.125) {
    const frontY = Math.round(FRAME.bar + (FRAME.line - FRAME.bar) * share);
    const backY = Math.round(back.top + (back.bottom - back.top) * share);

    for (const [frontX, backX] of [
      [FRAME.left, back.left],
      [FRAME.right, back.right],
    ]) {
      band(pen, {
        from: { x: frontX, y: frontY },
        to: { x: backX, y: backY },
        width: 1,
        color: net[0],
      });
    }
  }

  for (let x = FRAME.left + shape.mesh * 2; x < FRAME.right; x += shape.mesh * 2) {
    const along =
      back.left + ((x - FRAME.left) / (FRAME.right - FRAME.left)) * (back.right - back.left);
    const to = { x: along, y: back.top + sagAt(back, shape, along) };

    band(pen, { from: { x, y: FRAME.bar }, to, width: 1, color: net[0] });
  }
}

export function drawNet(pen, { bulge = null, style = FLOODLIT } = {}) {
  const shape = shapeOf(style);
  const job = { back: backOf(shape), shape, bulge, net: style.net };

  sides(pen, job);
  backPanel(pen, job);
}

// the posts and the bar: white tubes ringed in ink, lit down their left and along their top
function whiteFrame(pen, post) {
  const width = 3;
  const top = FRAME.bar - 1;

  pen.rect(
    [FRAME.left - width - 1, top - 1, FRAME.right - FRAME.left + width * 2 + 2, width + 2],
    DUEL_INK,
  );

  for (const x of [FRAME.left - width, FRAME.right]) {
    pen.rect([x - 1, top - 1, width + 2, FRAME.line - top + 2], DUEL_INK);
    pen.rect([x, top, width, FRAME.line - top + 1], post[2]);
    pen.rect([x, top, 1, FRAME.line - top + 1], post[3]);
    pen.rect([x + width - 1, top, 1, FRAME.line - top + 1], post[1]);
  }

  pen.rect([FRAME.left - width, top, FRAME.right - FRAME.left + width * 2, width], post[2]);
  pen.rect([FRAME.left - width, top, FRAME.right - FRAME.left + width * 2, 1], post[3]);
  pen.rect([FRAME.left, top + width - 1, FRAME.right - FRAME.left, 1], post[1]);
  pen.rect([FRAME.left - width - 1, FRAME.line + 1, width + 2, 1], post[0]);
  pen.rect([FRAME.right - 1, FRAME.line + 1, width + 2, 1], post[0]);
}

export function drawFrame(pen, style = FLOODLIT) {
  if (style.bamboo) {
    drawBambooFrame(pen, style);
  } else {
    whiteFrame(pen, style.post);
  }
}
