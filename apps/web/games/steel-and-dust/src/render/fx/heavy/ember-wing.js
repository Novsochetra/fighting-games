import { EMBER_HEAVY_ART } from '../../../art/heavy-fx/ember.js';
import { backOf } from '../../../sim/fx/heavy/ember-anchors.js';

const { wing: WING } = EMBER_HEAVY_ART;
// a phoenix wing raised behind the Shade, seen from the side, in world pixels as it faces right:
// its leading edge arches up and back from the shoulder to the tip
const EDGE = [
  [0, 0],
  [-3, -8],
  [-8, -14],
  [-14, -17],
  [-21, -17],
];
// feathers hang off the edge: where along it (0 shoulder, 1 tip), which way (degrees as it faces:
// 90 straight down, 180 straight back) and how long; short and hanging near the body, long and
// swept back at the tip, close enough to read as one wing
const FEATHER_COUNT = 9;
const FEATHERS = Array.from({ length: FEATHER_COUNT }, (_, i) => {
  const share = 0.18 + (i * 0.78) / (FEATHER_COUNT - 1);
  return [share, 108 + i * 7.5, 6 + 8 * Math.min(1, share / 0.8)];
});
// the short coverts along the edge, before the long feathers show
const COVERT = 4;
// how each heavy carries the wing (degrees, turning it forward): raised as the launcher rises,
// swept back on the dive
const TILTS = { UK: 22, ADK: -40 };
// the big heavies, where a phoenix wing flares behind the Shade as the blow lets go
export const WINGED = new Set(['K3', 'UK', 'C1', 'C2', 'ADK']);
// it opens the tick before the strike and holds, burns away from its root, then only its tips
// are left, drifting up as embers
const OPENING = [0.6, 1, 1, 1];
const LIFE = 6;

const radiansOf = (degrees) => (degrees * Math.PI) / 180;

function rotate([dx, dy], degrees) {
  const cos = Math.cos(radiansOf(degrees));
  const sin = Math.sin(radiansOf(degrees));
  return [dx * cos - dy * sin, dx * sin + dy * cos];
}

function pointAt(edge, share) {
  const reach = share * (edge.length - 1);
  const index = Math.min(edge.length - 2, Math.floor(reach));
  const part = reach - index;
  const [from, to] = [edge[index], edge[index + 1]];
  return [from[0] + (to[0] - from[0]) * part, from[1] + (to[1] - from[1]) * part];
}

// the wing's shape for this heavy and tick, as points relative to the shoulder
function wingShape({ tilt, open }) {
  const edge = EDGE.map((point) => rotate([point[0] * open, point[1] * open], tilt));
  const feathers = FEATHERS.map(([share, degrees, length]) => {
    const root = pointAt(edge, share);
    const reach = length * open;
    const [dx, dy] = rotate([Math.cos(radiansOf(degrees)), Math.sin(radiansOf(degrees))], tilt);
    const covert = Math.min(reach, COVERT * open);
    return {
      root,
      covert: [root[0] + dx * covert, root[1] + dy * covert],
      tip: [root[0] + dx * reach, root[1] + dy * reach],
    };
  });
  return { edge, feathers };
}

function drawFeather(painter, { from, covert, to, phase }) {
  const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  if (phase < OPENING.length) {
    painter.use(WING.vane).line(from, to, 2);
    painter.use(WING.shaft).line(middle, to, 1);
    painter.use(WING.edge).line(from, covert, 2);
  } else if (phase === OPENING.length) {
    painter.use(WING.shaft).line(middle, to, 2);
  }
  painter.use(WING.tip).rect(to.x, to.y - (phase > OPENING.length ? 2 : 0), 1, 1);
}

function drawFeathers(painter, { feathers, place, phase }) {
  for (const { root, covert, tip } of feathers) {
    drawFeather(painter, { from: place(root), covert: place(covert), to: place(tip), phase });
  }
}

function drawEdge(painter, { edge, place, phase }) {
  if (phase > OPENING.length) {
    return;
  }
  const hot = phase < OPENING.length;
  for (let i = 1; i < edge.length; i++) {
    const from = place(edge[i - 1]);
    const to = place(edge[i]);
    painter.use(hot ? WING.edge : WING.vane).line(from, to, 2);
    if (hot) {
      painter.use(WING.tip).line(from, to, 1);
    }
  }
}

// a phoenix wing of fire flares up behind the Shade as a big heavy lets go
export function drawWing(painter, { fighter, move, time, leanX }) {
  const phase = time - (move.startup - 1);
  if (!WINGED.has(move.id) || phase < 0 || phase >= LIFE) {
    return;
  }
  const back = backOf(fighter);
  const place = ([dx, dy]) => ({ x: back.x + leanX + dx * fighter.facing, y: back.y + dy });
  const shape = wingShape({ tilt: TILTS[move.id] ?? 0, open: OPENING[phase] ?? 1 });
  painter.alpha(phase < OPENING.length ? 1 : 0.75);
  drawFeathers(painter, { ...shape, place, phase });
  drawEdge(painter, { ...shape, place, phase });
  painter.alpha(1);
}
