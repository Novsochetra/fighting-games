import { SHOT_ART } from '../../colors.js';
import { ellipseDots } from './kit.js';

const TURN = Math.PI * 2;

// each ring is a tilted hoop round the ball seen a little from above: its lower arc passes in
// front of the ball, its upper arc behind
const RINGS = [
  { from: 0, radiusX: 13, radiusY: 4, tilt: -0.42, speed: 0.19, dashes: 2, length: 0.34 },
  { from: 0.3, radiusX: 12, radiusY: 3.5, tilt: 0.62, speed: -0.15, dashes: 3, length: 0.26 },
  { from: 0.6, radiusX: 17, radiusY: 5, tilt: 0.06, speed: 0.11, dashes: 2, length: 0.3 },
];

const SIDES = {
  front: { head: SHOT_ART.white, body: SHOT_ART.gold[3], tail: SHOT_ART.gold[2] },
  back: { head: SHOT_ART.emerald[4], body: SHOT_ART.emerald[3], tail: SHOT_ART.emerald[2] },
};

const wrap = (value) => ((value % 1) + 1) % 1;

function colourAt(angle, { ring, spin, side }) {
  const inFront = Math.sin(angle) > 0;

  if (inFront !== (side === 'front')) {
    return null;
  }

  const along = wrap((angle / TURN - spin) * ring.dashes);

  if (along > ring.length) {
    return null;
  }

  const colours = SIDES[side];
  const share = ring.speed > 0 ? along / ring.length : 1 - along / ring.length;

  if (share > 0.8) {
    return colours.head;
  }

  return share > 0.35 ? colours.body : colours.tail;
}

export function drawOrbits(pen, { ball, power, tick, side, shrink = 1 }) {
  RINGS.forEach((ring) => {
    const grown = Math.min(1, (power - ring.from) / 0.25);

    if (grown <= 0) {
      return;
    }

    const size = (0.6 + 0.4 * grown + power * 0.15) * shrink;
    const spin = (tick * ring.speed) / TURN;

    ellipseDots(pen, {
      x: ball.x,
      y: ball.y,
      radiusX: ring.radiusX * size,
      radiusY: ring.radiusY * size,
      tilt: ring.tilt,
      pick: (angle) => colourAt(angle, { ring, spin, side }),
    });
  });
}
