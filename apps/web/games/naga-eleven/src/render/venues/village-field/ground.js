import { grainOf, toneIndex } from '../ground/grass.js';
import { bayer, grain2, noiseOf } from '../kit/hash.js';
import { paddiesOf } from './paddies.js';
import { puddleSurface } from './puddle.js';

const patches = noiseOf(56, 3);
const specks = noiseOf(15, 4);
const clumps = noiseOf(5, 9);
const lushness = noiseOf(40, 8);
const wornLime = noiseOf(5, 12);

// the village field: thin grass worn through to red earth in the goalmouths and the middle, a
// puddle from last night's rain, and the paddies past the fence
function wearOf(x, y, { pitch }) {
  const mouth = Math.min(x, pitch.length - x) / 160;
  const middle = Math.abs(y - pitch.width / 2) / (pitch.width / 2);
  const centre = Math.hypot((x - pitch.length / 2) / 120, (y - pitch.width / 2) / 90);

  return Math.max(0, 1 - mouth - middle * 0.8) + Math.max(0, 0.7 - centre * 0.7);
}

function earthAt(dirt, column, row, art) {
  if (grain2(column, row, 61) < 0.008) {
    return art.dirt[5];
  }

  return art.dirt[toneIndex(3.4 - dirt * 0.6 + grainOf(column, row) * 0.5, column, row, art.dirt)];
}

export function villageSurface(layout, art) {
  const puddleAt = puddleSurface(layout, art);
  const paddyAt = paddiesOf(art);

  return (x, y, column, row) => {
    if (y < -22) {
      return paddyAt(x, y, column, row);
    }

    const wet = puddleAt(x, y, column, row);

    if (wet !== null) {
      return wet;
    }

    const patch = patches(x, y) * 0.6 + specks(x, y) * 0.4;
    const dirt = patch + wearOf(x, y, layout) * 0.62 - 0.74 + (bayer(column, row) - 0.5) * 0.14;

    if (dirt > 0) {
      return earthAt(dirt, column, row, art);
    }

    const clump = (clumps(x, y) - 0.5) * 1.6;
    const thin = Math.max(0, dirt + 0.14) * 9;
    const tone = 3 + lushness(x, y) * 1.1 + clump + thin + grainOf(column, row) * 0.6;

    return art.grass[toneIndex(tone, column, row, art.grass)];
  };
}

// lime marked by hand: bright, broken here and there where it has worn away
export function limeLines(art) {
  return (column, row, under) => {
    if (wornLime(column, row) < 0.22) {
      return under;
    }

    return grain2(column, row, 13) < 0.2 ? art.lime[0] : art.lime[1];
  };
}
