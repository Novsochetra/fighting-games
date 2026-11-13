import { SIGHT } from './layers.js';
import { TOUCHLINE, marksOf } from './marks.js';
import { TURF_TONES } from './palette.js';

const MOWN = { across: 48, along: 150 };

const OUTSIDE = TURF_TONES.dark - 1;

const distanceOf = (depth) => SIGHT / depth - SIGHT;

// the blades slide with their row, so they never shimmer as the camera moves
export function rowOf(ground, row) {
  const depth = ground.depthAt(row + 0.5);
  const farZ = distanceOf(ground.depthAt(row));
  const nearZ = distanceOf(ground.depthAt(row + 1));
  const inward = distanceOf(depth);

  return {
    row,
    depth,
    inside: inward < TOUCHLINE,
    band: Math.floor(inward / MOWN.along) & 1,
    marks: inward < TOUCHLINE + 40 ? marksOf({ nearZ, farZ }) : [],
    slide: Math.round(ground.middle * (1 - depth)),
    tufts: Math.round(4 + 10 * Math.max(0, depth - 0.7)),
  };
}

const onMark = (marks, x) => marks.some(([from, to]) => x >= from && x < to);

// cheaper than hash(), as it runs for every pixel of grass
function bladeOf(column, row) {
  let mixed = Math.imul(column ^ 0x5bd1e995, 0x27d4eb2d) ^ Math.imul(row, 0x165667b1);

  mixed ^= mixed >>> 15;

  return Math.imul(mixed, 0x2c1b3c6d) >>> 24;
}

function toneOf(info, x, column) {
  const blade = bladeOf(column - info.slide, info.row);
  const mown = info.inside ? (Math.floor(x / MOWN.across) & 1) + info.band : -1;
  const tone = mown < 0 ? OUTSIDE : TURF_TONES.dark + mown;

  if (onMark(info.marks, x)) {
    return blade < 40 ? TURF_TONES.lineShade : TURF_TONES.line;
  }

  if (blade < info.tufts) {
    return tone - 1;
  }

  return blade > 253 && info.depth > 0.9 ? TURF_TONES.fleck : tone;
}

export function fillRow(tones, { info, ground, from, offset, width }) {
  for (let i = 0; i < width; i += 1) {
    const column = from + i;
    const x = ground.worldX(column + 0.5, info.depth);

    tones[offset + i] = toneOf(info, x, column);
  }
}
