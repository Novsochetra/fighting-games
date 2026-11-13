import { hash } from '../../../../../../src/render/duel/hash.js';
import { headPoint } from '../../../../../../src/render/duel/looks/naga-head.js';
import { SHOT_ART } from '../../colors.js';
import { clamp01, easeIn, lerp } from '../../tracks/ease.js';
import { MANIFEST } from '../../tracks/naga.js';
import { GROUND } from '../../world.js';
import { humpOf, spineOf } from './spine.js';

// in head sizes from the middle of its head
const CREST = Array.from({ length: 9 }, (_, i) => {
  const angle = ((-244 + i * 23) * Math.PI) / 180;

  return [-3.2 + Math.cos(angle) * 11, -3.2 + Math.sin(angle) * 12.5];
});

const FACE = [
  [16, -4.6],
  [12.6, -1],
  [12.4, 7.6],
  [7, 5],
  [5, -2.6],
  [1, -6],
];

function sourcesOf({ x, y, size }) {
  const head = [...CREST, ...FACE].map((at) => headPoint({ x, y, size }, at));
  const body = [...spineOf(size), ...humpOf(size)]
    .filter((at, i) => i % 3 === 0 && y + at.y < GROUND)
    .map((at, i) => ({ x: x + at.x + (i % 2 ? 0.5 : -0.5) * at.radius, y: y + at.y }));

  return [...head, ...body];
}

const SOURCES = sourcesOf(MANIFEST);

const RAMPS = [
  [SHOT_ART.emerald[2], SHOT_ART.emerald[3], SHOT_ART.emerald[4]],
  [SHOT_ART.gold[1], SHOT_ART.gold[2], SHOT_ART.gold[3]],
];

const TAIL = 0.34;

function dotLine(pen, { from, to, colourAt }) {
  const steps = Math.max(1, Math.round(Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y))));

  for (let step = 0; step <= steps; step += 1) {
    const share = step / steps;

    pen.dot(
      Math.round(lerp(from.x, to.x, share)),
      Math.round(lerp(from.y, to.y, share)),
      colourAt(share),
    );
  }
}

// every part of it streams off on its own, later or sooner, and all of it reaches the ball together
function drawStreak(pen, { source, ball, compress, i }) {
  const delay = hash(i, 71) * 0.5;
  const share = clamp01((compress - delay) / (1 - delay));

  if (share <= 0) {
    return;
  }

  const ramp = RAMPS[i % 2];
  const along = (part) => ({
    x: lerp(source.x, ball.x, easeIn(part)),
    y: lerp(source.y, ball.y, easeIn(part)),
  });

  dotLine(pen, {
    from: along(Math.max(0, share - TAIL)),
    to: along(share),
    colourAt: (part) => (part >= 1 ? SHOT_ART.white : ramp[Math.min(2, Math.floor(part * 3))]),
  });
}

export function drawStreaks(pen, { compress, ball }) {
  SOURCES.forEach((source, i) => drawStreak(pen, { source, ball, compress, i }));
}
