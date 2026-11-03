import { CHALK, GRASS } from '../../../art/training/ground.js';
import { drawBag, drawBench, drawStack } from '../scenery/kit.js';
import { drawClouds, drawHills, drawSky, drawTrees, drawWall } from '../scenery/morning.js';
import { drawMannequin } from '../scenery/obstacles.js';
import { ART_VIEW, dither, line, oval, paint } from '../pixels.js';
import { MOUTH_ART } from './view.js';

const WALL = { top: 88, bottom: 112 };

// mown across the pitch, each stripe wider as it comes nearer
const STRIPE_EDGES = [112, 117, 124, 131, 140, 151, 164, 180, 198, 217];

function drawGrass(context) {
  STRIPE_EDGES.slice(0, -1).forEach((top, i) => {
    paint(context, GRASS.stripe[i % 2], [0, top, ART_VIEW.width, STRIPE_EDGES[i + 1] - top]);
  });
  dither(context, GRASS.dark, [0, WALL.bottom, ART_VIEW.width, 2]);
}

function drawLines(context) {
  const middle = MOUTH_ART.middle;
  const chalk = (from, to) => line(context, CHALK.line, [from, to]);

  paint(context, CHALK.line, [0, MOUTH_ART.ground, ART_VIEW.width, 1]);
  paint(context, CHALK.shade, [0, MOUTH_ART.ground + 1, ART_VIEW.width, 1]);
  chalk({ x: middle - 150, y: 124 }, { x: middle - 172, y: 148 });
  chalk({ x: middle + 150, y: 124 }, { x: middle + 172, y: 148 });
  paint(context, CHALK.line, [middle - 172, 148, 345, 1]);
  chalk({ x: middle - 290, y: 124 }, { x: middle - 380, y: 216 });
  chalk({ x: middle + 290, y: 124 }, { x: middle + 380, y: 216 });
  oval(context, CHALK.line, { x: middle, y: 199, radiusX: 3, radiusY: 1 });
}

function drawSideKit(context, tick) {
  drawStack(context, { x: 14, y: 118 });
  drawMannequin(context, { x: 44, y: 120 });
  drawMannequin(context, { x: 327, y: 120 });
  drawBench(context, { x: 372, y: 120, tick });
  drawBag(context, { x: 30, y: 206 });
}

export function drawBackdrop(context, { tick }) {
  drawSky(context);
  drawClouds(context, { camera: 0, tick });
  drawHills(context, { camera: 0, base: WALL.top });
  drawTrees(context, { camera: 120, base: WALL.top + 2 });
  drawWall(context, { camera: 0, top: WALL.top, bottom: WALL.bottom });
  drawGrass(context);
  drawLines(context);
  drawSideKit(context, tick);
}
