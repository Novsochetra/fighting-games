import { grainOf } from '../../../venues/ground/grass.js';
import { grain2, noiseOf } from '../../../venues/kit/hash.js';
import { toneOf } from '../tone.js';

// the village field seen from the penalty spot, in the venue's own manner (its ground.js): thin
// grass worn through to red earth, bare in the goalmouth where the keeper stands; the noise is
// read in the venue's world units, about fifteen to the metre, so its patches are the same size
const PER_METRE = 15;
const LINE = 11;
const patches = noiseOf(56, 3);
const specks = noiseOf(15, 4);
const clumps = noiseOf(5, 9);
const lushness = noiseOf(40, 8);

// worn bare in front of the goal and under the net, the most by the line between the posts
function wearOf({ across, depth }) {
  const mouth = Math.max(0, 1 - (across / 3.8) ** 2);
  const reach = depth > LINE ? (depth - LINE) / 2.6 : (LINE - depth) / 5.2;

  return mouth * Math.max(0, 1 - reach ** 1.5) * 1.5;
}

function earthAt(dirt, column, row, art) {
  if (grain2(column, row, 61) < 0.012) {
    return art.dirt[5];
  }

  return toneOf(art.dirt, 3.6 - dirt * 0.9 + grainOf(column, row) * 0.6, column, row);
}

export function fieldAt(spot, column, row, art) {
  const x = spot.across * PER_METRE;
  const y = spot.depth * PER_METRE;
  const patch = patches(x, y) * 0.65 + specks(x, y) * 0.35;
  const dirt = patch * 0.8 + wearOf(spot) * 0.7 - 0.78;

  if (dirt > 0) {
    return earthAt(dirt, column, row, art);
  }

  const clump = (clumps(x, y) - 0.5) * 1.4;
  const thin = Math.max(0, dirt + 0.12) * 10;
  const tone = 3.1 + (lushness(x, y) - 0.5) * 1.6 + clump + thin + grainOf(column, row) * 0.8;

  return toneOf(art.grass, tone, column, row);
}

// the low dike the field ends at: a grassy top over a face of packed red earth
export function dikeAt(column, row, art) {
  const tuft = grain2(column, row, 62) < 0.3;

  return tuft ? toneOf(art.grass, 4.2, column, row) : toneOf(art.grass, 5.3, column, row);
}

// lime marked by hand, as the venue's: bright, worn away here and there, a pixel of shade under it
export function limeOf(art) {
  const worn = noiseOf(5, 12);

  return (column, row, shade) => {
    if (worn(column * 3, row * 7) < 0.22) {
      return null;
    }

    if (shade) {
      return art.lime[0];
    }

    return grain2(column, row, 13) < 0.2 ? art.lime[0] : art.lime[1];
  };
}
