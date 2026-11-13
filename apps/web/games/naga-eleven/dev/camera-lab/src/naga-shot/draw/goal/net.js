import { baked, stamp } from '../bake.js';
import { OUTLINE, PROFILE } from './shape.js';

function crossings(points, rowY) {
  const found = [];

  points.forEach(([ax, ay], i) => {
    const [bx, by] = points[(i + 1) % points.length];

    if (ay <= rowY !== by <= rowY) {
      found.push(ax + ((rowY - ay) / (by - ay)) * (bx - ax));
    }
  });

  return found.sort((first, second) => first - second);
}

const MESH = 6;

const onStrand = (value) => ((value % MESH) + MESH) % MESH === 0;

// a net's strands: a diamond lattice pinned to `origin`, so it moves with the goal and never crawls
const isKnot = (x, y, origin) =>
  onStrand(x - origin.x + y - origin.y) || onStrand(x - origin.x - y + origin.y);

function meshRow(pen, { row, from, to, colour, origin }) {
  for (let x = from; x < to; x += 1) {
    if (isKnot(x, row, origin)) {
      pen.dot(x, row, colour);
    }
  }
}

export function meshPolygon(pen, points, { colour, origin }) {
  const ys = points.map(([, y]) => y);

  for (let row = Math.floor(Math.min(...ys)); row <= Math.ceil(Math.max(...ys)); row += 1) {
    const found = crossings(points, row + 0.5);

    for (let i = 0; i + 1 < found.length; i += 2) {
      meshRow(pen, {
        row,
        from: Math.round(found[i]),
        to: Math.round(found[i + 1]),
        colour,
        origin,
      });
    }
  }
}

// a side net has the same shape wherever the camera is, only moved, so it is knotted once a side
function sideCanvas({ side, depth, colour }) {
  const width = Math.ceil((PROFILE.back.x - PROFILE.post.x) * depth) + 2;
  const height = Math.ceil(PROFILE.bar.h * depth) + 2;
  const points = OUTLINE.map((name) => [
    1 + (PROFILE[name].x - PROFILE.post.x) * depth,
    height - 1 - PROFILE[name].h * depth,
  ]);

  return baked(`goal-side-${side}-${colour}`, {
    width,
    height,
    paint: (pen) => meshPolygon(pen, points, { colour, origin: { x: 1, y: height - 1 } }),
  });
}

export function drawSideNet(pen, { view, side, colour }) {
  const depth = view.depthOf(side);
  const foot = view.at(PROFILE.post, side);
  const left = Math.round(foot.x) - 1;
  const canvas = sideCanvas({ side, depth, colour });

  if (canvas) {
    stamp(pen, canvas, { left, top: Math.round(foot.y) - canvas.height + 1 });

    return;
  }

  const points = OUTLINE.map((name) => view.at(PROFILE[name], side)).map(({ x, y }) => [x, y]);

  meshPolygon(pen, points, {
    colour,
    origin: { x: left, y: Math.round(foot.y) },
  });
}

export function drawDepthNets(pen, { view, colour }) {
  const origin = view.at(PROFILE.post, 'near');
  const knots = { x: Math.round(origin.x), y: Math.round(origin.y) };
  const quad = (from, to) =>
    [view.at(from, 'near'), view.at(to, 'near'), view.at(to, 'far'), view.at(from, 'far')].map(
      ({ x, y }) => [x, y],
    );

  meshPolygon(pen, quad(PROFILE.bar, PROFILE.support), { colour, origin: knots });
  meshPolygon(pen, quad(PROFILE.support, PROFILE.back), { colour, origin: knots });
}
