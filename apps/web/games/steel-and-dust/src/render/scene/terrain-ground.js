import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';
import { STEP_UP } from '../../sim/stage/terrain.js';
import { drawRoadDetails, drawSwayingGrass } from './road-details.js';

const TOP_SOIL = 11;
const DEEP_SOIL = 22;

// columns of the same height are drawn as one block, so a long level stretch costs a few rects
export function surfaceRuns(surfaceAt, from, to) {
  const runs = [];
  for (let x = from; x < to; x++) {
    const y = surfaceAt(x);
    const last = runs.at(-1);
    if (last && last.y === y) {
      last.width++;
    } else {
      runs.push({ x, width: 1, y });
    }
  }
  return runs;
}

// soil darkens with depth below the local surface; a checkered row softens each band edge
function drawSoilRun(painter, { x, width, y }, colors) {
  painter.use(colors.sand).rect(x, y, width, TOP_SOIL);
  painter.use(colors.soil).rect(x, y + TOP_SOIL, width, DEEP_SOIL - TOP_SOIL);
  for (let column = x + (x % 2); column < x + width; column += 2) {
    painter.rect(column, y + TOP_SOIL - 1, 1, 1);
  }
  painter.use(colors.soilDeep).rect(x, y + DEEP_SOIL, width, VIEW_HEIGHT - y - DEEP_SOIL);
  for (let column = x + (x % 2); column < x + width; column += 2) {
    painter.rect(column, y + DEEP_SOIL - 1, 1, 1);
  }
  painter.use(colors.grassDark).rect(x, y, width, 1);
  painter.use(colors.lip).rect(x, y + 1, width, 1);
}

// a sheer step shows its earth face on the high side, with the lip catching the light
function drawStepFace(painter, high, low, colors) {
  const faceX = high.x < low.x ? high.x + high.width - 2 : high.x;
  painter.use(colors.rut).rect(faceX, high.y + 2, 2, low.y - high.y);
  painter.use(colors.pebble).rect(faceX, high.y + 2 + ((low.y - high.y) >> 1), 2, 2);
  painter.use(colors.glint).rect(faceX, high.y, 2, 1);
}

function drawStepFaces(painter, runs, colors) {
  for (let i = 1; i < runs.length; i++) {
    const [before, after] = [runs[i - 1], runs[i]];
    if (Math.abs(before.y - after.y) > STEP_UP) {
      const [high, low] = before.y < after.y ? [before, after] : [after, before];
      drawStepFace(painter, high, low, colors);
    }
  }
}

// the painted cross-section is anchored to the road, so it scrolls with it and wraps every tile;
// its last row runs on down to the bottom of the view under a high hill
function drawTextureRun(context, { image, top }, { x, width, y }) {
  const tileWidth = image.width;
  const bottom = y - top + image.height;
  for (let drawn = 0; drawn < width;) {
    const sourceX = (((x + drawn) % tileWidth) + tileWidth) % tileWidth;
    const span = Math.min(width - drawn, tileWidth - sourceX);
    context.drawImage(
      image,
      sourceX,
      0,
      span,
      image.height,
      x + drawn,
      y - top,
      span,
      image.height,
    );
    if (bottom < VIEW_HEIGHT) {
      const rest = VIEW_HEIGHT - bottom;
      context.drawImage(image, sourceX, image.height - 1, span, 1, x + drawn, bottom, span, rest);
    }
    drawn += span;
  }
}

export function drawTerrainGround(painter, { cameraX, colors, tick, surfaceAt, texture }) {
  const runs = surfaceRuns(surfaceAt, cameraX, cameraX + VIEW_WIDTH);
  const painted = texture?.ready;
  for (const run of runs) {
    if (painted) {
      drawTextureRun(painter.context, texture, run);
    } else {
      drawSoilRun(painter, run, colors);
    }
  }
  drawStepFaces(painter, runs, colors);
  if (!painted) {
    drawRoadDetails(painter, { cameraX, colors, tick, surfaceAt });
  }
  drawSwayingGrass(painter, { cameraX, colors, tick, surfaceAt });
}
