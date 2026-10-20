import { GROUND_Y, VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';
import { hashInt } from '../../lib/math.js';
import { drawForestGround } from './forest-ground.js';

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

// grass along the road's edge, its tips leaning with a slow wind that runs down the road
function drawGrass(painter, { cameraX, colors, tick }) {
  for (let x = Math.floor(cameraX / 5) * 5; x < cameraX + VIEW_WIDTH + 5; x += 5) {
    const hash = hashInt(x + 7);
    const height = 2 + (hash % 4);
    const lean = Math.round(Math.sin(tick / 45 + x * 0.05) * (height > 3 ? 1 : 0.6));
    painter.use(colors.grassDark).rect(x, GROUND_Y - 1, 3, 2);
    painter.use(colors.grass).rect(x + 1, GROUND_Y - height + 1, 1, height - 1);
    painter.use(colors.grassLight).rect(x + 1 + lean, GROUND_Y - height, 1, 1);
    if (hash % 3 === 0) {
      painter.use(colors.grass).rect(x + 3 + lean, GROUND_Y - 2, 1, 2);
    }
  }
}

export function drawGround(painter, cameraX, colors, tick) {
  if (colors.grass) {
    drawForestGround(painter, cameraX, colors);
    drawGrass(painter, { cameraX, colors, tick });
    return;
  }
  painter.use(colors.sand).rect(cameraX, GROUND_Y, VIEW_WIDTH, VIEW_HEIGHT - GROUND_Y);
  painter.use(colors.edge).rect(cameraX, GROUND_Y, VIEW_WIDTH, 1);
  painter.use(colors.lip).rect(cameraX, GROUND_Y + 1, VIEW_WIDTH, 2);
  drawPebbles(painter, cameraX, colors);
  drawRuts(painter, cameraX, colors);
}
