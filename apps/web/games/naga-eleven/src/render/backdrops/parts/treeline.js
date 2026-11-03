import { smoothNoise } from '../hash.js';
import { plot, vline } from '../raster.js';

// a far wall of trees on the horizon: a soft rolling top of canopy over broad crowns, `colors`
// [body, edge] in the haze of distance
export function paintTreeline(
  raster,
  { horizon, height, colors, seed = 1, from = 0, to = raster.width },
) {
  for (let x = from; x < to; x += 1) {
    const broad = smoothNoise(seed, x, 23);
    const crowns = smoothNoise(seed + 1, x, 6);
    const top = Math.round(horizon - height * (0.35 + 0.45 * broad + 0.3 * crowns));

    vline(raster, { x, y: top, length: horizon - top + 1 }, colors[0]);
    plot(raster, x, top, colors[1]);
  }
}

// low bushes and banana leaves along a dike: a lumpy band with a lit rim
export function paintHedge(raster, { left, right, ground, height, colors, seed = 1 }) {
  for (let x = left; x < right; x += 1) {
    const top = Math.round(ground - height * (0.3 + 0.7 * smoothNoise(seed, x, 4)));

    vline(raster, { x, y: top, length: ground - top + 1 }, colors[0]);
    plot(raster, x, top, colors[1]);
  }
}
