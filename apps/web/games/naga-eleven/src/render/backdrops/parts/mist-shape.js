import { mixes } from '../dither.js';
import { hash } from '../hash.js';

// the share of a wisp's density over which its thin mist dithers in from nothing, and the share
// from which its thick heart shows through, dithered in over HEART_FADE
const THIN_FADE = 0.4;
const HEART_FROM = 0.45;
const HEART_FADE = 0.3;
// mist lies on the ground: it thins out quickly below its middle and slowly above
const FOOT = 0.6;

function puffsOf(seed, length) {
  const count = 2 + Math.floor(length / 28);

  return Array.from({ length: count }, (_, i) => {
    const along = (i + 0.5) / count;
    const swell = 1 - Math.abs(along * 2 - 1);

    return {
      x: along * length + (hash(seed, i, 6) - 0.5) * 8,
      y: -swell * 1.5 + (hash(seed, i, 7) - 0.5) * 2,
      radiusX: 8 + swell * 16 + hash(seed, i, 8) * 8,
      radiusY: 1.5 + swell * 2 + hash(seed, i, 9) * 1.5,
    };
  });
}

// falling off straight from a puff's middle, not as a dome, so its ends taper over several pixels
function densityAt(puffs, x, y) {
  let most = 0;

  for (const puff of puffs) {
    const across = (x - puff.x) / puff.radiusX;
    const down = (y - puff.y) / (y > puff.y ? puff.radiusY * FOOT : puff.radiusY);

    most = Math.max(most, 1 - Math.sqrt(across * across + down * down));
  }

  return most;
}

// the tone a pixel of the wisp takes, if any: 1 its heart, 0 its thin edge, null none
function toneAt(puffs, x, y) {
  const density = densityAt(puffs, x, y);

  if (mixes(x, y, (density - HEART_FROM) / HEART_FADE)) {
    return 1;
  }

  return mixes(x, y, density / THIN_FADE) ? 0 : null;
}

function runsOfRow(puffs, { row, length }) {
  const runs = [];

  for (let x = -24; x < length + 24; x += 1) {
    const tone = toneAt(puffs, x, row);
    const last = runs.at(-1);

    if (tone !== null && last && last.tone === tone && last.to === x) {
      last.to = x + 1;
    } else if (tone !== null) {
      runs.push({ row, from: x, to: x + 1, tone });
    }
  }

  return runs;
}

const kept = new Map();

// a wisp's pixels as runs along its rows, in its own art pixels from its left end and its middle
// row; each wisp is worked out once, as it only ever drifts whole
export function wispShape(seed, length) {
  const key = `${seed}:${length}`;

  if (!kept.has(key)) {
    const puffs = puffsOf(seed, length);

    kept.set(
      key,
      [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3].flatMap((row) => runsOfRow(puffs, { row, length })),
    );
  }

  return kept.get(key);
}
