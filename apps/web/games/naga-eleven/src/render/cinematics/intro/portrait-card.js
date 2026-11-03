import { CINE } from '../../../art/cinematics/palette.js';
import { drawPortrait, PORTRAIT_SIZE } from '../../portraits/index.js';

export const PORTRAIT_SCALE = 2;
export const CARD_SIZE = PORTRAIT_SIZE * PORTRAIT_SCALE + 8;

const STRIPE = 8;

function drawBackground(context, { x, y, size, kit }) {
  context.fillStyle = kit.shirt[1];
  context.fillRect(x, y, size, size);
  context.fillStyle = kit.shirt[0];

  for (let row = 0; row < size; row += 1) {
    for (let column = (row % (STRIPE * 2)) - STRIPE * 2; column < size; column += STRIPE * 2) {
      const from = Math.max(0, column);
      const to = Math.min(size, column + STRIPE);

      if (to > from) {
        context.fillRect(x + from, y + row, to - from, 1);
      }
    }
  }

  context.fillStyle = kit.shirt[2];
  context.fillRect(x, y + size - 3, size, 3);
}

function drawFrame(context, { x, y, size }) {
  context.fillStyle = CINE.ink;
  context.fillRect(x - 1, y - 1, size + 2, size + 2);
  context.fillStyle = CINE.gold[1];
  context.fillRect(x, y, size, size);
  context.fillStyle = CINE.gold[3];
  context.fillRect(x, y, size - 1, 1);
  context.fillRect(x, y, 1, size - 1);
  context.fillStyle = CINE.gold[2];
  context.fillRect(x + 1, y + 1, size - 2, size - 2);
  context.fillStyle = CINE.ink;
  context.fillRect(x + 3, y + 3, size - 6, size - 6);
}

function drawSheen(context, { x, y, size, tick }) {
  const at = (tick % 150) * 4 - size;

  if (at < -8 || at > size) {
    return;
  }

  context.globalAlpha = 0.35;
  context.fillStyle = CINE.white;

  for (let row = 0; row < size; row += 1) {
    const from = Math.max(0, at + Math.round(row / 2));
    const to = Math.min(size, from + 6);

    if (to > from) {
      context.fillRect(x + from, y + row, to - from, 1);
    }
  }

  context.globalAlpha = 1;
}

export function drawPortraitCard(context, { x, y, rival, kit, tick, flip }) {
  const left = Math.round(x);
  const top = Math.round(y);
  const inner = { x: left + 4, y: top + 4, size: CARD_SIZE - 8 };

  drawFrame(context, { x: left, y: top, size: CARD_SIZE });
  drawBackground(context, { ...inner, kit });
  drawPortrait(context, {
    character: rival.character,
    age: rival.age,
    mood: rival.mood,
    x: inner.x,
    y: inner.y,
    scale: PORTRAIT_SCALE,
    flip,
  });
  drawSheen(context, { ...inner, tick });
}
