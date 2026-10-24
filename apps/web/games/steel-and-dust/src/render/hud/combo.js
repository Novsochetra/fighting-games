import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { comboRank } from '../../sim/combat/combo.js';
import { drawText } from '../text/draw-text.js';

const RIGHT = VIEW_WIDTH - 8;

function comboColor(count) {
  if (count >= 20) {
    return COLORS.salmon;
  }
  return count >= 10 ? COLORS.amber : COLORS.butter;
}

function jitterStep(tickCount) {
  return tickCount & 1 ? 1 : -1;
}

// the thin bar under the counter is the time left to land the next hit
function drawLiveCombo(painter, { combo, tickCount }) {
  const bumped = combo.bump > 3;
  const scale = bumped ? 4 : 3;
  const color = comboColor(combo.count);
  const jitter = bumped ? jitterStep(tickCount) : 0;
  const below = 40 + scale * 5;
  drawText(painter, combo.count, { x: RIGHT + jitter, y: 40, color, scale, align: 'right' });
  drawText(painter, 'HITS', { x: RIGHT, y: below + 3, color: COLORS.sand, align: 'right' });
  const rank = comboRank(combo.count);
  if (rank) {
    drawText(painter, rank, { x: RIGHT, y: below + 11, color, align: 'right' });
  }
  drawText(painter, `${Math.round(combo.damage)} DMG`, {
    x: RIGHT,
    y: below + 19,
    color: COLORS.lilac,
    align: 'right',
  });
  const width = 40;
  const left = combo.timer / 110;
  painter.use(HUD_COLORS.barBack).rect(RIGHT - width, below + 27, width, 2);
  painter
    .use(color)
    .rect(RIGHT - Math.round(width * left), below + 27, Math.round(width * left), 2);
}

function slideOffset(time) {
  if (time < 8) {
    return (8 - time) * 6;
  }
  return time > 96 ? (time - 96) * 8 : 0;
}

// the results of the combo that just ended slide in and out
function drawComboResult(painter, { comboResult: result, tickCount }) {
  const x = RIGHT + slideOffset(result.time);
  drawText(painter, `${result.count} HIT COMBO`, {
    x,
    y: 44,
    color: COLORS.butter,
    align: 'right',
  });
  if (result.rank) {
    const color = result.count >= 20 ? COLORS.salmon : COLORS.amber;
    drawText(painter, result.rank, { x, y: 52, color, scale: 2, align: 'right' });
  }
  drawText(painter, `${Math.round(result.damage)} DMG`, {
    x,
    y: 66,
    color: COLORS.lilac,
    align: 'right',
  });
  if (result.best && (tickCount >> 3) & 1) {
    drawText(painter, 'NEW BEST!', { x, y: 74, color: COLORS.mint, align: 'right' });
  }
}

export function drawCombo(painter, game) {
  if (game.combo.count >= 2) {
    drawLiveCombo(painter, game);
  } else if (game.comboResult) {
    drawComboResult(painter, game);
  }
}
