import { TROPHY } from '../../../art/cinematics/icons.js';
import { CINE } from '../../../art/cinematics/palette.js';
import { backOut, shareOf } from '../shared/ease.js';
import { drawBox } from '../shared/panel.js';
import { drawPixelMap } from '../shared/pixel-map.js';
import { drawWords, widthOf } from '../shared/words.js';
import { BOARD, MIDDLE } from './layout.js';

const HEIGHT = 24;
const TAIL = { width: 22, drop: 6, notch: 7 };
const TROPHY_WIDTH = TROPHY.rows[0].length;
const RISE = { start: 18, ticks: 14, from: 30 };

function drawTail(context, { x, y, kit, facing }) {
  const rows = HEIGHT - TAIL.drop;
  const middle = (rows - 1) / 2;

  for (let row = -1; row <= rows; row += 1) {
    const depth = Math.round(TAIL.notch * (1 - Math.abs(row - middle) / (middle + 1)));
    const width = TAIL.width - depth;
    const from = facing < 0 ? x - TAIL.width + depth : x;
    const inside = row >= 0 && row < rows;

    context.fillStyle = CINE.ink;
    context.fillRect(from - 1, y + row, width + 2, 1);

    if (inside) {
      context.fillStyle = row === 0 ? kit.band[1] : kit.band[0];
      context.fillRect(from, y + row, width, 1);
    }
  }
}

function drawGlint(context, { x, y, tick }) {
  const phase = tick % 70;

  if (phase > 8) {
    return;
  }

  const reach = phase < 4 ? phase : 8 - phase;

  context.fillStyle = CINE.white;
  context.fillRect(x - reach, y, reach * 2 + 1, 1);
  context.fillRect(x, y - reach, 1, reach * 2 + 1);
}

export function drawWinRibbon(context, { y, kit, words, age, tick = 0 }) {
  const rise = backOut(shareOf(age, RISE.start, RISE.ticks));

  if (rise <= 0) {
    return;
  }

  const width = widthOf(context, words, 16) + TROPHY_WIDTH * 2 + 44;
  const left = Math.round(MIDDLE - width / 2);
  const top = Math.round(y + BOARD.height - HEIGHT / 2 + (1 - rise) * RISE.from);

  drawTail(context, { x: left + 4, y: top + TAIL.drop, kit, facing: -1 });
  drawTail(context, { x: left + width - 4, y: top + TAIL.drop, kit, facing: 1 });
  drawBox(context, { x: left, y: top, width, height: HEIGHT }, kit.band);
  drawPixelMap(context, TROPHY.rows, { x: left + 10, y: top + 6, colours: TROPHY.colours });
  drawPixelMap(context, TROPHY.rows, {
    x: left + width - 10 - TROPHY_WIDTH,
    y: top + 6,
    colours: TROPHY.colours,
  });
  drawWords(context, words, {
    x: MIDDLE,
    y: top + 5,
    size: 16,
    color: CINE.white,
    align: 'center',
  });
  drawGlint(context, { x: left + 13, y: top + 7, tick });
}
