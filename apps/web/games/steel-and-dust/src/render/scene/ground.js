import { GROUND_Y, VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';
import { hashInt } from '../../lib/math.js';
import { groundAt } from '../../sim/stage/terrain.js';
import { drawTerrainGround } from './terrain-ground.js';

export function drawTiled(painter, image, offset) {
  const width = image.width;
  const start = -(((offset % width) + width) % width);
  for (let x = start; x < VIEW_WIDTH; x += width) {
    painter.context.drawImage(image, Math.round(x), 0);
  }
}

function drawPebbles(painter, cameraX, colors) {
  for (let x = Math.floor(cameraX / 16) * 16; x < cameraX + VIEW_WIDTH + 16; x += 16) {
    const hash = hashInt(x);
    if (hash % 3 === 0) {
      painter
        .use(colors.pebble)
        .rect(x + (hash % 9), GROUND_Y + 5 + ((hash >> 4) % 22), 2 + (hash % 3), 1);
    }
    if (hash % 5 === 0) {
      painter
        .use(colors.glint)
        .rect(x + ((hash >> 3) % 12), GROUND_Y + 3 + ((hash >> 6) % 24), 1, 1);
    }
  }
}

function drawRuts(painter, cameraX, colors) {
  for (let x = Math.floor(cameraX / 40) * 40; x < cameraX + VIEW_WIDTH + 40; x += 40) {
    const hash = hashInt(x + 99);
    if (hash % 4) {
      painter.use(colors.rut).rect(x, GROUND_Y + 15, 24 + (hash % 12), 1);
      painter.use(colors.rut).rect(x + 6, GROUND_Y + 23, 20 + (hash % 10), 1);
    }
  }
}

// a painted road follows the terrain's hills and steps; the drawn desert roads stay flat as they were
export function drawGround(painter, { cameraX, colors, tick, terrain, texture, painted }) {
  if (painted) {
    const surfaceAt = (x) => groundAt(terrain, x);
    drawTerrainGround(painter, { cameraX, colors, tick, surfaceAt, texture });
    return;
  }
  painter.use(colors.sand).rect(cameraX, GROUND_Y, VIEW_WIDTH, VIEW_HEIGHT - GROUND_Y);
  painter.use(colors.edge).rect(cameraX, GROUND_Y, VIEW_WIDTH, 1);
  painter.use(colors.lip).rect(cameraX, GROUND_Y + 1, VIEW_WIDTH, 2);
  drawPebbles(painter, cameraX, colors);
  drawRuts(painter, cameraX, colors);
}
