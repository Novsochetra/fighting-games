import { COLORS } from '../../art/colors.js';
import { currentZone } from '../../sim/stage/mission.js';
import { drawText, textWidth } from '../text/draw-text.js';
import { drawHudFrame } from './hud-frames.js';
import { HERO_PLAQUE, ROW_ONE, ROW_TWO, TOP_BAR_HEIGHT } from './top-bar.js';

// the plaque follows the hero's, which keeps the top right corner clear for the touch pause button
export const SCORE_PLAQUE_X = HERO_PLAQUE.width + 4;
const PADDING = 8;
const CELL_GAP = 8;

// the shown score counts up toward the real one
function easeScore(view, score) {
  if (view.shownScore > score) {
    view.shownScore = score;
  } else {
    view.shownScore += Math.ceil((score - view.shownScore) * 0.18);
  }
  return view.shownScore;
}

export function formatClock(ticks) {
  const seconds = Math.floor(ticks / 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function waveText(game) {
  const { waveIndex } = game.stage;
  const zone = currentZone(game);
  if (!game.arena || !zone || zone.boss || waveIndex < 0) {
    return null;
  }
  return `WAVE ${Math.min(waveIndex + 1, zone.waves.length)}/${zone.waves.length}`;
}

function cell(text, color) {
  return text ? { text, color } : null;
}

export function scoreRows(game, shown) {
  const best = game.records.bestCombo;
  return [
    {
      left: cell(`SCORE ${String(shown).padStart(7, '0')}`, COLORS.sand),
      right: cell(best && `BEST ${best} HITS`, COLORS.lilac),
    },
    {
      left: cell(`TIME ${formatClock(game.playTime)}`, COLORS.lilac),
      right: cell(waveText(game), COLORS.sand),
    },
  ];
}

function rowWidth({ left, right }) {
  const widths = [left, right].filter(Boolean).map(({ text }) => textWidth(text, 1));
  return widths.reduce((sum, width) => sum + width, 0) + (widths.length - 1) * CELL_GAP;
}

// the plaque fits its widest row, on the same line as the hero's plaque
export function scorePlaque(rows) {
  const width = Math.max(...rows.map(rowWidth)) + PADDING * 2;
  return { x: SCORE_PLAQUE_X, y: 0, width, height: TOP_BAR_HEIGHT };
}

function drawRow(painter, { left, right }, { plaque, y }) {
  if (left) {
    drawText(painter, left.text, { x: plaque.x + PADDING, y, color: left.color });
  }
  if (right) {
    const x = plaque.x + plaque.width - PADDING;
    drawText(painter, right.text, { x, y, color: right.color, align: 'right' });
  }
}

export function drawScore(painter, game, view) {
  const rows = scoreRows(game, easeScore(view, game.score));
  const plaque = scorePlaque(rows);
  painter
    .alpha(0.55)
    .use(COLORS.night)
    .rect(plaque.x + 2, 2, plaque.width - 4, plaque.height - 4);
  painter.alpha(1);
  drawHudFrame(painter, view.hudFrames, 'score', plaque);
  drawRow(painter, rows[0], { plaque, y: ROW_ONE });
  drawRow(painter, rows[1], { plaque, y: ROW_TWO });
}
