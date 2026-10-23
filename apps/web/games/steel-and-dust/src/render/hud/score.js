import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { drawText } from '../text/draw-text.js';
import { drawPlaque } from './hud-frames.js';
import { ROW_ONE, ROW_TWO, TOP_BAR_HEIGHT } from './top-bar.js';

const PADDING = 8;
const WIDTH = 80;

export const SCORE_BOX = {
  x: VIEW_WIDTH - WIDTH,
  y: 0,
  width: WIDTH,
  height: TOP_BAR_HEIGHT,
};

// the shown score counts up toward the real one
function easeScore(view, score) {
  if (view.shownScore > score) {
    view.shownScore = score;
  } else {
    view.shownScore += Math.ceil((score - view.shownScore) * 0.18);
  }
  return view.shownScore;
}

export function scoreRows(game, shown) {
  const rows = [{ label: 'SCORE', value: String(shown).padStart(7, '0'), color: COLORS.sand }];
  const best = game.records.bestCombo;
  if (best) {
    rows.push({ label: 'BEST', value: `${best} HITS`, color: COLORS.lilac });
  }
  return rows;
}

// each label sits flush left and its value flush right
function drawRow(painter, { label, value, color }, y) {
  const { x, width } = SCORE_BOX;
  drawText(painter, label, { x: x + PADDING, y, color });
  drawText(painter, value, { x: x + width - PADDING, y, color, align: 'right' });
}

export function drawScore(painter, game, view) {
  drawPlaque(painter, view.hudFrames, 'score', SCORE_BOX);
  const rows = scoreRows(game, easeScore(view, game.score));
  rows.forEach((row, i) => drawRow(painter, row, [ROW_ONE, ROW_TWO][i]));
}
