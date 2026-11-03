import { drawDustCloud, drawRing, drawWall } from './ground.js';
import { drawBurst, drawSparks } from './light.js';
import { drawFeathers, drawSplash } from './water.js';

export const IMPACT_SHAPES = {
  burst: drawBurst,
  splash: drawSplash,
  feathers: drawFeathers,
  ring: drawRing,
  wall: drawWall,
  sparks: drawSparks,
  dust: drawDustCloud,
};
