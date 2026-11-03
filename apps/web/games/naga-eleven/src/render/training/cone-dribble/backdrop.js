import { drawClouds, drawHills, drawSky, drawTrees, drawWall } from '../scenery/morning.js';
import { FIELD } from './view.js';

const WALL_TOP = 66;

export function drawBackdrop(context, { camera, tick }) {
  drawSky(context);
  drawClouds(context, { camera, tick });
  drawHills(context, { camera, base: WALL_TOP });
  drawTrees(context, { camera, base: WALL_TOP + 2 });
  drawWall(context, { camera, top: WALL_TOP, bottom: FIELD.top });
}
