import { GROUND_Y, VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';
import { hashInt } from '../../lib/math.js';

// soil darkens with depth; a checkered row softens each step so the bands read as one slope
function drawSoil(painter, cameraX, colors) {
  const bands = [
    [GROUND_Y, colors.sand],
    [GROUND_Y + 11, colors.soil],
    [GROUND_Y + 22, colors.soilDeep],
  ];
  bands.forEach(([top, color], index) => {
    painter.use(color).rect(cameraX, top, VIEW_WIDTH, VIEW_HEIGHT - top);
    if (index > 0) {
      for (let x = cameraX - (cameraX % 2); x < cameraX + VIEW_WIDTH; x += 2) {
        painter.rect(x, top - 1, 1, 1);
      }
    }
  });
}

function drawStones(painter, cameraX, colors) {
  for (let x = Math.floor(cameraX / 23) * 23; x < cameraX + VIEW_WIDTH + 23; x += 23) {
    const hash = hashInt(x + 41);
    if (hash % 3 === 0) {
      continue;
    }
    const width = 3 + (hash % 4);
    const y = GROUND_Y + 6 + ((hash >>> 5) % 20);
    painter.use(colors.pebble).rect(x + (hash % 11), y, width, 2 + ((hash >>> 3) % 2));
    painter.use(colors.glint).rect(x + (hash % 11) + 1, y, width - 2, 1);
  }
}

function drawRoots(painter, cameraX, colors) {
  for (let x = Math.floor(cameraX / 37) * 37; x < cameraX + VIEW_WIDTH + 37; x += 37) {
    const hash = hashInt(x + 113);
    if (hash % 2) {
      continue;
    }
    const y = GROUND_Y + 4 + ((hash >>> 4) % 9);
    painter.use(colors.rut).rect(x, y, 6 + (hash % 8), 1);
    painter.rect(x + 5 + (hash % 8), y + 1, 4 + ((hash >>> 2) % 5), 1);
  }
}

function drawLitter(painter, cameraX, colors) {
  for (let x = Math.floor(cameraX / 7) * 7; x < cameraX + VIEW_WIDTH + 7; x += 7) {
    const hash = hashInt(x + 271);
    if (hash % 4 === 0) {
      painter.use(hash % 3 ? colors.grassDark : colors.glint);
      painter.rect(x + (hash % 6), GROUND_Y + 3 + ((hash >>> 6) % 12), 1, 1);
    }
  }
}

export function drawForestGround(painter, cameraX, colors) {
  drawSoil(painter, cameraX, colors);
  painter.use(colors.grassDark).rect(cameraX, GROUND_Y, VIEW_WIDTH, 1);
  painter.use(colors.lip).rect(cameraX, GROUND_Y + 1, VIEW_WIDTH, 1);
  drawRoots(painter, cameraX, colors);
  drawStones(painter, cameraX, colors);
  drawLitter(painter, cameraX, colors);
}
