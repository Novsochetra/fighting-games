import { kitImpact } from '../kit-sprites.js';
import { drawDustCloud, drawWall } from './ground.js';
import { drawSparks } from './light.js';
import { drawFeathers, drawSplash } from './water.js';

export const IMPACT_SHAPES = {
  burst: kitImpact('star'),
  splash: drawSplash,
  feathers: drawFeathers,
  ring: kitImpact('shock', { onGround: true }),
  wall: drawWall,
  sparks: drawSparks,
  dust: drawDustCloud,
};
