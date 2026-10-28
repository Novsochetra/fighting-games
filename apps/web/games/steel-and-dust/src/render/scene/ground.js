import { floorBelow, groundAt } from '../../sim/stage/terrain.js';
import { drawnSurface, drawTerrainGround } from './terrain-ground.js';

// the road follows the terrain's hills and steps, laid from the backdrop's painted cross-section
export function drawGround(painter, { cameraX, colors, tick, terrain, backdrop }) {
  const surfaceAt = (x) => groundAt(terrain, x);
  const { ground: texture, cliff, deep } = backdrop ?? {};
  drawTerrainGround(painter, { cameraX, colors, tick, surfaceAt, texture, cliff, deep });
}

// what the light from straight overhead meets in each column: a deck over the road there, or the
// road's turf as it is drawn
export function floorUnderSky(terrain, backdrop) {
  const { ground: texture, cliff } = backdrop ?? {};
  const turfAt = drawnSurface((x) => groundAt(terrain, x), { texture, cliff });

  return (x) => {
    const floor = floorBelow(terrain, x, -Infinity);

    return floor < groundAt(terrain, x) ? floor : turfAt(x);
  };
}
