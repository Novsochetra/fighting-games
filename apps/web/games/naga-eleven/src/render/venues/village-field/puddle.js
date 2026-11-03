import { toneIndex } from '../ground/grass.js';
import { bayer, noiseOf } from '../kit/hash.js';

// last night's rain: a pool with a lobe off its side and a little one beside it, its shore pushed in
// and out by noise, a rim of wet mud round it, the far bank and the sky in the water, short glints
// of light and the rings of a drop
const shore = noiseOf(12, 21);
const mud = noiseOf(7, 22);
const MUD_REACH = 1.22;
const DAMP_REACH = 1.42;
// the world units round the puddle that can hold any of it, so the rest of the field skips it
const BOUNDS = { x: 130, y: 52 };

export function puddleOf({ pitch }) {
  const x = pitch.length * 0.23;
  const y = pitch.width * 0.72;

  return {
    x,
    y,
    pools: [
      { x, y, radiusX: 46, radiusY: 19 },
      { x: x + 38, y: y + 7, radiusX: 24, radiusY: 11 },
      { x: x - 66, y: y - 5, radiusX: 11, radiusY: 5 },
    ],
    drop: { x: x + 12, y: y - 3 },
  };
}

const ellipse = (pool, x, y) =>
  Math.sqrt(((x - pool.x) / pool.radiusX) ** 2 + ((y - pool.y) / pool.radiusY) ** 2);

// how far from the middle of the nearest pool a point lies: under 1 is water
export function reachOf(puddle, x, y) {
  const nearest = Math.min(...puddle.pools.map((pool) => ellipse(pool, x, y)));

  return nearest + (shore(x, y) - 0.5) * 0.32;
}

function rimAt(reach, { x, y, column, row }, art) {
  const edge = MUD_REACH + (mud(x, y) - 0.5) * 0.2;

  if (reach < 1.05) {
    return art.dirt[0];
  }

  if (reach < edge) {
    return art.dirt[toneIndex(1.1 + (reach - 1) * 4, column, row, art.dirt)];
  }

  return bayer(column, row) < (DAMP_REACH - reach) * 2.5 ? art.dirt[2] : null;
}

// the rings a drop sends out: lit on their far side, shaded on their near one, fainter as they go
function rippleAt(puddle, { x, y, column, row }) {
  const across = (x - puddle.drop.x) / 2.3;
  const down = y - puddle.drop.y;
  const distance = Math.sqrt(across * across + down * down);

  for (const [radius, strength] of [
    [3.5, 1],
    [7, 0.75],
    [11, 0.45],
  ]) {
    if (Math.abs(distance - radius) < 0.7 && bayer(column, row) < strength) {
      return down < 0 ? 5 : 1;
    }
  }

  return null;
}

function waterAt(puddle, reach, point, art) {
  const { y, column, row } = point;
  const ripple = rippleAt(puddle, point);

  if (ripple !== null) {
    return art.water[ripple];
  }

  // the far bank stands upside down along the far shore
  if (reach > 0.68 && y < puddle.y + 2) {
    return art.water[bayer(column, row) < (reach - 0.68) * 4 ? 0 : 1];
  }

  if (((column >> 2) * 7 + row * 13) % 61 === 0 && reach < 0.6) {
    return art.water[5];
  }

  const sky = (puddle.y - y) / 20;

  return art.water[toneIndex(2.7 + sky * 0.9 - reach * 0.8, column, row, art.water)];
}

// the puddle's colour at a point, or null where the field shows
export function puddleSurface(layout, art) {
  const puddle = puddleOf(layout);

  return (x, y, column, row) => {
    if (Math.abs(x - puddle.x) > BOUNDS.x || Math.abs(y - puddle.y) > BOUNDS.y) {
      return null;
    }

    const reach = reachOf(puddle, x, y);
    const point = { x, y, column, row };

    if (reach < 1) {
      return waterAt(puddle, reach, point, art);
    }

    return reach < DAMP_REACH ? rimAt(reach, point, art) : null;
  };
}
