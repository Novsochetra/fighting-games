import { VIEW_WIDTH } from '../../config.js';
import { hashInt } from '../../lib/math.js';
import { groundAt } from '../stage/terrain.js';

const STEP = 4;
const DEPTH = 4;

// the crack zigzags a few px down the face of the ground, never over its surface; its points are
// fixed to the road, so the same stretch of road always cracks the same way
export function fissurePoints(terrain, { left, right }) {
  const points = [];
  for (let x = Math.floor(left / STEP) * STEP; x <= right + STEP; x += STEP) {
    points.push([x, groundAt(terrain, x) + 1 + (hashInt(x / STEP) % DEPTH)]);
  }
  return points;
}

// a crack that runs out from `x` both ways across the screen over `run` ticks
export function addFissure(game, { x, color, run, duration }) {
  const left = game.camera.x - STEP;
  const points = fissurePoints(game.terrain, { left, right: left + VIEW_WIDTH + STEP });
  game.effects.push({ kind: 'fissure', x, points, color, run, time: 0, duration });
}
