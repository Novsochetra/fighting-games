import { grainOf } from '../../venues/ground/grass.js';
import { grain2, noiseOf } from '../../venues/kit/hash.js';
import { DEPTH } from '../view.js';
import { toneOf } from './tone.js';

// A stadium's pitch from the penalty spot, mown in bands across the view that widen as they come
// nearer, as the night's grass is; `light(spot)` adds or takes away tone (the shadow of a stand),
// and the goalmouth is worn to `sand` where the venue's is (its wornGoalmouths)
const STRIPE = 2.2;
const wear = noiseOf(9, 14);

function wornAt({ across, depth }, sand) {
  const mouth =
    Math.max(0, 1 - (across / 3.2) ** 2) * Math.max(0, 1 - Math.abs(depth - 10.4) / 2.4);

  return sand && mouth > 0 ? mouth + wear(across * 15, depth * 15) * 0.6 - 0.9 : 0;
}

export function pitchAt(spot, column, row, { art, light = () => 0, sand = false }) {
  const worn = wornAt(spot, sand);

  if (worn > 0) {
    return toneOf(art.sand, 2.6 + worn * 2 + grainOf(column, row) * 0.6, column, row);
  }

  const band = Math.floor((DEPTH.line - spot.depth) / STRIPE) & 1;
  const tone = 3.2 + band * 0.9 + light(spot) + grainOf(column, row) * 0.5;

  return toneOf(art.grass, tone, column, row);
}

// chalk, mostly bright with a worn pixel here and there, a pixel of shade under each line
export const chalkOf = (art) => (column, row, shade) => {
  if (shade) {
    return art.line[0];
  }

  return grain2(column, row, 31) < 0.12 ? art.line[0] : art.line[1];
};
