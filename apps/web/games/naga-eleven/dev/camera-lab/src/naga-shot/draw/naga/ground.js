import { hash } from '../../../../../../src/render/duel/hash.js';
import { ellipse } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';
import { humpOf, spineOf } from './spine.js';

const bodies = new Map();

function bodiesAt(size) {
  if (!bodies.has(size)) {
    bodies.set(size, [spineOf(size), humpOf(size)]);
  }

  return bodies.get(size);
}

function crossings(points, { at, floor }) {
  return points.slice(1).flatMap((point, i) => {
    const before = points[i];
    const below = [before, point].map((one) => at.y + one.y >= floor);

    return below[0] === below[1] ? [] : [{ x: Math.round(at.x + point.x), radius: point.radius }];
  });
}

const POOL = [
  { wider: 9, deep: 3.5, color: SHOT_ART.ink },
  { wider: 6, deep: 2.6, color: SHOT_ART.emerald[2] },
  { wider: 3, deep: 1.7, color: SHOT_ART.emerald[3] },
  { wider: -1, deep: 0.9, color: SHOT_ART.emerald[4] },
];

const CHUNKS = 14;

const CLOD_COLOURS = [
  SHOT_ART.grass[0],
  SHOT_ART.emerald[1],
  SHOT_ART.grass[1],
  SHOT_ART.emerald[3],
];

function drawClods(pen, { base, floor, ticks }) {
  for (let i = 0; i < CHUNKS; i += 1) {
    const flight = ticks - Math.floor(hash(i, 61) * 10);
    const side = hash(i, 62) * 2 - 1;
    const x = base.x + side * (base.radius + 4 + flight * (1 + hash(i, 63) * 1.4));
    const y = floor - flight * (2.4 + hash(i, 64) * 1.6) + flight * flight * 0.11;
    const size = hash(i, 65) < 0.4 ? 2 : 1;

    if (flight > 0 && y < floor) {
      pen.rect([Math.round(x), Math.round(y), size, size], CLOD_COLOURS[i % CLOD_COLOURS.length]);
    }
  }
}

function drawPool(pen, { base, floor, flicker }) {
  POOL.forEach(({ wider, deep, color }) => {
    ellipse(pen, {
      x: base.x + 0.5,
      y: floor - 1,
      radiusX: base.radius + wider + flicker,
      radiusY: deep,
      color,
    });
  });
}

export function drawGround(pen, { at, size, floor, ticks }) {
  const [rising, ...looped] = bodiesAt(size).flatMap((points) => crossings(points, { at, floor }));
  const flicker = Math.round(hash(Math.floor(ticks / 3), 66) * 2);

  looped.forEach((base) => drawPool(pen, { base, floor, flicker: 0 }));

  if (rising) {
    drawPool(pen, { base: rising, floor, flicker });
    drawClods(pen, { base: rising, floor, ticks });
  }
}
