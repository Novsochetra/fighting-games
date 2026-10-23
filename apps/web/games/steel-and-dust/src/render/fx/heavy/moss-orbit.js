import { activeEnd } from '../../../data/moves/define-move.js';

// a spinning heavy whirls a cyclone of leaves round the Shade on two tilted rings, each leaf trailing
// a curve of light; the far side of the rings is drawn behind it, darker
const RINGS = [
  { y: -18, rx: 14, ry: 3 },
  { y: -9, rx: 18, ry: 5 },
];
const LEAVES_PER_RING = 4;
const SPIN = 0.75;
const TAIL = 4;
const TAIL_STEP = 0.26;

function tailColors(art, front) {
  return front
    ? [art.bloom, art.glow, art.thornLight, art.thorn]
    : [art.thornLight, art.thorn, art.outline, art.outline];
}

function drawLeaf(painter, { at, angle, facing, colors, color, art }) {
  for (let step = TAIL; step >= 1; step--) {
    const tail = at(angle - step * TAIL_STEP * facing);
    painter.use(colors[step - 1]).rect(tail.x, tail.y, 1, 1);
  }
  const head = at(angle);
  painter.use(art.leafShade).rect(head.x - 1, head.y + 1, 2, 1);
  painter.use(color).rect(head.x - 1, head.y, 2, 1);
}

export function drawOrbit(painter, { fighter, move, time, art }, front) {
  const since = time - move.startup;
  if (since < 0 || time >= activeEnd(move) + 2) {
    return;
  }
  const colors = tailColors(art, front);
  RINGS.forEach((ring, ringIndex) => {
    const at = (turn) => ({
      x: fighter.x + Math.cos(turn) * ring.rx,
      y: fighter.y + ring.y + Math.sin(turn) * ring.ry,
    });
    for (let i = 0; i < LEAVES_PER_RING; i++) {
      const offset = ((i + ringIndex / 2) / LEAVES_PER_RING) * Math.PI * 2;
      const angle = offset + since * SPIN * fighter.facing;
      if (Math.sin(angle) > 0 === front) {
        const color = art.leaves[(i + ringIndex) % art.leaves.length];
        drawLeaf(painter, { at, angle, facing: fighter.facing, colors, color, art });
      }
    }
  });
}
