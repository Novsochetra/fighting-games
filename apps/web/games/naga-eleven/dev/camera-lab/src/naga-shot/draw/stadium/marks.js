import { GOAL } from '../../world.js';

// the pitch's lines in art pixels: x along the pitch (the goal line at GOAL.line), and how far a
// line runs in from the players' plane (+ away from the camera); a man's 58 pixels are 1.8 m
const METRE = 32;

const AREA = { depth: 5.5 * METRE, half: 9.16 * METRE };

const BOX = { depth: 16.5 * METRE, half: 20.16 * METRE };

const SPOT = GOAL.line - 11 * METRE;

const ARC = 9.15 * METRE;

const WIDE = 3;

export const TOUCHLINE = 33 * METRE;

const across = (from, to) => [Math.min(from, to), Math.max(from, to)];

function boxLines(box, row) {
  const front = GOAL.line - box.depth;
  const lines = [];

  if (row.nearZ < box.half && row.farZ > -box.half) {
    lines.push([front, front + WIDE]);
  }

  if ([box.half, -box.half].some((side) => row.nearZ <= side && side < row.farZ)) {
    lines.push([front, GOAL.line]);
  }

  return lines;
}

const arcX = (inward) => SPOT - Math.sqrt(Math.max(0, ARC * ARC - inward * inward));

function arcLines(row) {
  const reach = Math.sqrt(ARC * ARC - (SPOT - (GOAL.line - BOX.depth)) ** 2);
  const nearZ = Math.max(-reach, row.nearZ);
  const farZ = Math.min(reach, row.farZ);

  if (nearZ >= farZ) {
    return [];
  }

  const [from, to] = across(arcX(nearZ), arcX(farZ));

  return [[from - 1, to + 1]];
}

export function marksOf(row) {
  if (row.nearZ <= TOUCHLINE && TOUCHLINE < row.farZ) {
    return [[-Infinity, Infinity]];
  }

  const lines = [[GOAL.line, GOAL.line + WIDE], ...boxLines(AREA, row), ...boxLines(BOX, row)];

  if (row.nearZ <= 0 && 0 < row.farZ) {
    lines.push([SPOT - 1, SPOT + 2]);
  }

  return [...lines, ...arcLines(row)];
}
