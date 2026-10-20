import { groundAt } from '../../sim/stage/terrain.js';
import { drawTerrainGround } from './terrain-ground.js';

// the road follows the terrain's hills and steps, laid from the backdrop's painted cross-section
export function drawGround(painter, { cameraX, colors, tick, terrain, backdrop }) {
  const surfaceAt = (x) => groundAt(terrain, x);
  const { ground: texture, cliff } = backdrop ?? {};
  drawTerrainGround(painter, { cameraX, colors, tick, surfaceAt, texture, cliff });
}
