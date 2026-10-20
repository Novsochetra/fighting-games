import { VIEW_HEIGHT } from '../../../config.js';

function drawBlock(painter, x, { hash, colors }) {
  const width = 16 + (hash % 10);
  const height = 6 + ((hash >>> 4) % 4);
  const top = VIEW_HEIGHT - height;
  painter.use(colors.blockShade).rect(x - 1, top + 1, width + 2, height - 1);
  painter.use(colors.block).rect(x, top, width, height);
  painter.use(colors.blockLight).rect(x + 1, top, width - 2, 1);
  painter.use(colors.blockShade).rect(x + 2, top + 3, width - 4, 1);
  painter.rect(x + 4 + ((hash >>> 8) % 6), top + 1, 1, 2);
  painter.use(colors.drift).rect(x - 3, VIEW_HEIGHT - 2, width + 6, 2);
}

function drawSherds(painter, x, { hash, colors }) {
  for (let i = 0; i < 4; i++) {
    const offsetX = i * 5 + ((hash >>> (i * 3)) % 4);
    const lift = (hash >>> (i * 2 + 5)) % 3;
    painter.use(colors.sherd).rect(x + offsetX, VIEW_HEIGHT - 3 - lift, 3, 2);
    painter.use(colors.sherdLight).rect(x + offsetX, VIEW_HEIGHT - 3 - lift, 2, 1);
  }
  painter
    .use(colors.sherd)
    .rect(x + 8, VIEW_HEIGHT - 7, 1, 4)
    .rect(x + 9, VIEW_HEIGHT - 8, 3, 1);
}

function drawReeds(painter, x, { hash, colors, tick }) {
  const stalks = 4 + (hash % 3);
  for (let i = 0; i < stalks; i++) {
    const height = 9 + ((hash >>> i) % 8);
    const nod = Math.round(Math.sin(tick / 45 + hash + i * 0.8) * 1.2);
    const stalkX = x + i * 2 + ((hash >>> (i + 3)) % 2);
    painter.use(i % 2 ? colors.reed : colors.reedLight);
    painter.rect(stalkX, VIEW_HEIGHT - height + 3, 1, height - 3);
    painter.rect(stalkX + nod, VIEW_HEIGHT - height, 1, 3);
  }
}

// reeds come up twice as often as stone, so what passes in front of the fighters stays airy
const PIECES = [drawBlock, drawReeds, drawSherds, drawReeds];

export function drawRuins(painter, x, scene) {
  PIECES[(scene.hash >>> 12) % PIECES.length](painter, x, scene);
}
