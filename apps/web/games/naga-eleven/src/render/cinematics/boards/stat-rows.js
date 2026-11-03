import { CINE } from '../../../art/cinematics/palette.js';
import { easeOut, shareOf } from '../shared/ease.js';
import { STAT_LABELS } from '../shared/labels.js';
import { drawInset } from '../shared/panel.js';
import { drawWords, wordsOf } from '../shared/words.js';
import { BOARD, BOARD_MOTION, MIDDLE, STATS } from './layout.js';
import { possessionShare } from './stats.js';

const ROWS = ['possession', 'shots', 'saves', 'passes', 'tacklesWon', 'duelsWon'];
const BAR = { height: 6, gap: 1 };

export function statRow(stats, key) {
  const values = key === 'possession' ? possessionShare(stats) : stats[key];

  return {
    key,
    values,
    words: values.map((value) => (key === 'possession' ? `${value}%` : String(value))),
  };
}

export const statRows = (stats) => ROWS.map((key) => statRow(stats, key));

function span(context, { from, to, y, height }, colour) {
  if (to > from) {
    context.fillStyle = colour;
    context.fillRect(from, y, to - from, height);
  }
}

function drawSplitBar(context, { values, kits, y, grow }) {
  const total = values[0] + values[1];
  const left = MIDDLE - STATS.reach;
  const split = left + Math.round((total ? values[0] / total : 0.5) * STATS.reach * 2);
  const home = { from: Math.round(split - (split - left) * grow), to: split - BAR.gap, y };
  const away = {
    from: split + BAR.gap,
    to: Math.round(split + (MIDDLE + STATS.reach - split) * grow),
    y,
  };
  const shade = total ? 2 : 0;

  drawInset(context, { x: left - 1, y: y - 1, width: STATS.reach * 2 + 2, height: BAR.height + 2 });
  span(context, { ...home, height: BAR.height }, kits[0].band[shade]);
  span(context, { ...away, height: BAR.height }, kits[1].band[shade]);
  span(context, { ...home, height: 1 }, kits[0].band[shade + 1]);
  span(context, { ...away, height: 1 }, kits[1].band[shade + 1]);
}

function drawRow(context, { row, kits, y, grow, lang }) {
  const lead = row.values[0] === row.values[1] ? -1 : Number(row.values[1] > row.values[0]);
  const colourOf = (side) => (side === lead ? CINE.gold[3] : CINE.text);
  const valueX = STATS.reach + 14;

  drawWords(context, wordsOf(STAT_LABELS[row.key], lang), {
    x: MIDDLE,
    y,
    color: CINE.muted,
    align: 'center',
    outline: null,
  });
  drawSplitBar(context, { values: row.values, kits, y: y + 12, grow });
  drawWords(context, row.words[0], {
    x: MIDDLE - valueX,
    y: y + 6,
    size: 16,
    color: colourOf(0),
    align: 'right',
  });
  drawWords(context, row.words[1], { x: MIDDLE + valueX, y: y + 6, size: 16, color: colourOf(1) });
}

export function drawStatRows(context, { stats, kits, y, age, lang }) {
  const top = y + (STATS.y - BOARD.y);

  statRows(stats).forEach((row, i) => {
    const grow = easeOut(shareOf(age, BOARD_MOTION.bars + i * BOARD_MOTION.barStep, 20));

    drawRow(context, { row, kits, y: top + i * STATS.row, grow, lang });
  });
}
