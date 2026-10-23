import { clamp, hashInt } from '../../lib/math.js';

// a crack in the road: a jagged line wandering out both ways from its heart along the surface, with
// forks that run down into the road's face; the same seed draws the same crack every time
const NODES = 8;
const NODE_GAP = 2.5;
const SWINGS = [0, 0.5, 1, 1];
const FORKS = { 1: [2, 5], [-1]: [3, 6] };
const FORK = [
  [1, 1.5],
  [1.5, 3],
  [2.5, 4.5],
];

function forkFrom(node, side) {
  const start = Math.abs(node.x);
  let from = node;
  return FORK.map(([ahead, down], i) => {
    const to = { x: node.x + side * ahead, y: node.y + down };
    const segment = { from, to, start: start + i, reach: start + i + 1, fork: true };
    from = to;
    return segment;
  });
}

// each node wanders a little above or below the surface, and the line drifts down into the road's
// face as it runs
function nodeAt(seed, side, i) {
  const roll = hashInt(seed * 64 + i * side + 128);
  const swing = SWINGS[roll % SWINGS.length] * ((roll >>> 8) & 1 ? -1 : 1);
  return {
    x: side * (i * NODE_GAP + ((roll >>> 4) % 3) * 0.5),
    y: Math.round((swing + i * 0.3) * 2) / 2,
  };
}

function crackSide(seed, side) {
  const segments = [];
  let last = { x: 0, y: 0 };
  for (let i = 1; i <= NODES; i++) {
    const node = nodeAt(seed, side, i);
    segments.push({ from: last, to: node, start: Math.abs(last.x), reach: Math.abs(node.x) });
    if (FORKS[side].includes(i)) {
      segments.push(...forkFrom(node, side));
    }
    last = node;
  }
  return segments;
}

export const crackPath = (seed) => [...crackSide(seed, -1), ...crackSide(seed, 1)];

// the part of the crack open once it has run `open` pixels out from its heart, the stretch it is
// running along cut where its end has got to
export function openCrack(segments, open) {
  return segments
    .filter((segment) => segment.start < open)
    .map((segment) => {
      const share = clamp((open - segment.start) / (segment.reach - segment.start), 0, 1);
      const to = {
        x: segment.from.x + (segment.to.x - segment.from.x) * share,
        y: segment.from.y + (segment.to.y - segment.from.y) * share,
      };
      return { ...segment, to, running: share < 1 };
    });
}
