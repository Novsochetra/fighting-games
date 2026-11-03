import { drawInked } from './naga-ink.js';
import { rimmed } from './naga-shape.js';

// the side of the body its back is on at each point: left of the way it swims when the head faces
// right, so the back runs on from the crest of the head
function backs(points, facing) {
  return points.map((at, i) => {
    const from = points[Math.max(0, i - 1)];
    const to = points[Math.min(points.length - 1, i + 1)];
    const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;

    return { x: ((to.y - from.y) / length) * facing, y: (-(to.x - from.x) / length) * facing };
  });
}

// what lies within the body keeps a pixel and more off its edge, so rounding a thin body never
// leaves it standing bare on the sky with no ink round it
const INSET = 1.2;

// a stripe's two sides at a point, in pixels off the middle of the body toward its back
function sidesAt(radius, { from, to }) {
  if (from <= -1 && to >= 1) {
    return [-radius, radius];
  }

  return [Math.max(from * radius, INSET - radius), Math.min(to * radius, radius - INSET)];
}

// one stripe along the body, `from` to `to` across it (-1 the belly's edge, 1 the back's), joined
// round at every point so a bend leaves no gap
function stripe(body, { from, to, color, ink = false }) {
  const spans = body.points.map((at, i) => {
    const [low, high] = sidesAt(at.radius, { from, to });
    const back = body.backs[i];
    const middle = (low + high) / 2;

    return { x: at.x + back.x * middle, y: at.y + back.y * middle, width: high - low };
  });

  return spans.flatMap((here, i) => {
    if (here.width < 0.5) {
      return [];
    }

    const width = Math.max(1, here.width);
    const round = { kind: 'disc', x: here.x, y: here.y, radius: width / 2, color, ink };

    return i > 0
      ? [{ kind: 'band', from: spans[i - 1], to: here, width, color, ink }, round]
      : [round];
  });
}

// a plate across the belly at a point, and a scale on the back between the plates
function marks(body, art) {
  return body.points.flatMap((at, i) => {
    const back = body.backs[i];
    const across = (pixels) => ({ x: at.x + back.x * pixels, y: at.y + back.y * pixels });

    if (at.radius < 3) {
      return [];
    }

    const plate = {
      kind: 'band',
      from: across(INSET + 0.5 - at.radius),
      to: across(-0.42 * at.radius),
      width: 1,
      color: art.accent[1],
    };
    const scale = {
      kind: 'disc',
      ...across((i % 2 ? 0.2 : 0.5) * at.radius),
      radius: Math.max(0.6, at.radius * 0.14),
      color: art.body[1],
    };

    return [plate, scale];
  });
}

// a fin of gold standing off the back every few scales, swept toward the tail
function fins(body, art) {
  return body.points.flatMap((at, i) => {
    const back = body.backs[i];
    const behind = body.points[Math.max(0, i - 2)];

    if (i % 3 !== 1 || at.radius < 2) {
      return [];
    }

    const tip = [behind.x + back.x * at.radius * 1.9, behind.y + back.y * at.radius * 1.9];
    const root = [at.x + back.x * at.radius * 0.2, at.y + back.y * at.radius * 0.2];
    const part = { kind: 'poly', points: [root, tip, [behind.x, behind.y]], ink: true };

    return rimmed([{ ...part, color: art.accent[3] }], art.accent[2]);
  });
}

// the Naga's body from its tail to its neck: its back in the body's colours lit along the top,
// its belly in gold plates, scales between and gold fins off its back, ringed in ink
export function drawNagaBody(pen, { points, art, facing = 1 }) {
  const body = { points, backs: backs(points, facing) };
  const stripes = [
    { from: -0.2, to: 0.9, color: art.body[2] },
    { from: 0.4, to: 0.78, color: art.body[3] },
    { from: -0.92, to: -0.36, color: art.accent[2] },
    { from: -0.92, to: -0.74, color: art.accent[1] },
  ];

  drawInked(pen, [
    ...fins(body, art),
    ...rimmed(stripe(body, { from: -1, to: 1, color: art.body[4], ink: true }), art.body[1]),
    ...stripes.flatMap((one) => stripe(body, one)),
    ...marks(body, art),
  ]);
}
