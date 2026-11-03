import { KBACH_CORNER } from '../../../art/cinematics/icons.js';
import { CINE } from '../../../art/cinematics/palette.js';
import { drawBox } from '../shared/panel.js';
import { drawPixelMap } from '../shared/pixel-map.js';
import { drawWords, widthOf } from '../shared/words.js';
import { BOARD, HEADER, MIDDLE } from './layout.js';

const CORNER = KBACH_CORNER.rows.length;
const FOOT_ROWS = [...KBACH_CORNER.rows].reverse();

function drawCorners(context, { x, y, width, height }) {
  const { rows, colours } = KBACH_CORNER;
  const right = x + width - 4 - CORNER;
  const foot = y + height - 4 - CORNER;

  drawPixelMap(context, rows, { x: x + 4, y: y + 4, colours });
  drawPixelMap(context, rows, { x: right, y: y + 4, colours, flip: true });
  drawPixelMap(context, FOOT_ROWS, { x: x + 4, y: foot, colours });
  drawPixelMap(context, FOOT_ROWS, { x: right, y: foot, colours, flip: true });
}

export function drawBoardFrame(context, { y }) {
  const rect = { ...BOARD, y };

  drawBox(context, rect);
  context.fillStyle = CINE.gold[1];
  context.fillRect(rect.x + 2, y + 2, rect.width - 4, 1);
  context.fillRect(rect.x + 2, y + rect.height - 3, rect.width - 4, 1);
  context.fillRect(rect.x + 2, y + 2, 1, rect.height - 4);
  context.fillRect(rect.x + rect.width - 3, y + 2, 1, rect.height - 4);
  drawCorners(context, rect);
}

export function drawHeader(context, { y, words, minute, ramp = CINE.gold }) {
  const top = y - (BOARD.y - HEADER.y);
  const left = MIDDLE - HEADER.width / 2;
  const onGold = ramp === CINE.gold;
  const chip = widthOf(context, minute) + 10;

  drawBox(context, { x: left, y: top, width: HEADER.width, height: HEADER.height }, ramp);
  drawWords(context, words, {
    x: MIDDLE,
    y: top + 5,
    size: 16,
    color: onGold ? CINE.ink : CINE.white,
    outline: onGold ? null : CINE.ink,
    align: 'center',
  });
  drawBox(context, { x: left + HEADER.width + 6, y: top + 6, width: chip, height: 12 });
  drawWords(context, minute, { x: left + HEADER.width + 11, y: top + 8, outline: null });
}

export function drawDivider(context, { y }) {
  const reach = BOARD.width / 2 - 40;

  context.fillStyle = CINE.gold[1];
  context.fillRect(MIDDLE - reach, y, reach * 2, 1);
  context.fillStyle = CINE.gold[2];

  for (let row = -3; row <= 3; row += 1) {
    const half = 3 - Math.abs(row);

    context.fillRect(MIDDLE - half, y + row, half * 2 + 1, 1);
  }
}
