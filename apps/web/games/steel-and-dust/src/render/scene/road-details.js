import { VIEW_WIDTH } from '../../config.js';
import { hashInt } from '../../lib/math.js';

// each detail sits a fixed depth below the surface where it lies, so it rides up hills with it
function everyStep(cameraX, step, draw) {
  for (let x = Math.floor(cameraX / step) * step; x < cameraX + VIEW_WIDTH + step; x += step) {
    draw(x);
  }
}

function drawStones(painter, { cameraX, colors, surfaceAt }) {
  everyStep(cameraX, 23, (x) => {
    const hash = hashInt(x + 41);
    if (hash % 3 === 0) {
      return;
    }
    const left = x + (hash % 11);
    const width = 3 + (hash % 4);
    const y = surfaceAt(left) + 6 + ((hash >>> 5) % 20);
    painter.use(colors.pebble).rect(left, y, width, 2 + ((hash >>> 3) % 2));
    painter.use(colors.glint).rect(left + 1, y, width - 2, 1);
  });
}

function drawRoots(painter, { cameraX, colors, surfaceAt }) {
  everyStep(cameraX, 37, (x) => {
    const hash = hashInt(x + 113);
    if (hash % 2) {
      return;
    }
    const y = surfaceAt(x) + 4 + ((hash >>> 4) % 9);
    painter.use(colors.rut).rect(x, y, 6 + (hash % 8), 1);
    painter.rect(x + 5 + (hash % 8), y + 1, 4 + ((hash >>> 2) % 5), 1);
  });
}

function drawLitter(painter, { cameraX, colors, surfaceAt }) {
  everyStep(cameraX, 7, (x) => {
    const hash = hashInt(x + 271);
    if (hash % 4 === 0) {
      const left = x + (hash % 6);
      painter.use(hash % 3 ? colors.grassDark : colors.glint);
      painter.rect(left, surfaceAt(left) + 3 + ((hash >>> 6) % 12), 1, 1);
    }
  });
}

// grass along the road's edge, its tips leaning with a slow wind that runs down the road
export function drawSwayingGrass(painter, { cameraX, colors, tick, surfaceAt }) {
  everyStep(cameraX, 9, (x) => {
    const hash = hashInt(x + 7);
    const top = surfaceAt(x + 1);
    const height = 2 + (hash % 4);
    const lean = Math.round(Math.sin(tick / 45 + x * 0.05) * (height > 3 ? 1 : 0.6));
    painter.use(colors.grassDark).rect(x, top - 1, 3, 2);
    painter.use(colors.grass).rect(x + 1, top - height + 1, 1, height - 1);
    painter.use(colors.grassLight).rect(x + 1 + lean, top - height, 1, 1);
    if (hash % 3 === 0) {
      painter.use(colors.grass).rect(x + 3 + lean, top - 2, 1, 2);
    }
  });
}

// what the soil shows when there is no painted cross-section to lay down
export function drawRoadDetails(painter, road) {
  drawRoots(painter, road);
  drawStones(painter, road);
  drawLitter(painter, road);
}
