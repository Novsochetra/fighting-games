import { SUMMARY_COLORS as COLORS } from '../../art/mission-summary.js';
import { drawText, textWidth } from '../text/draw-text.js';

const LABEL_PADDING = 3;

function drawRim(painter, { x, y, width, height }) {
  const right = x + width - 1;
  const bottom = y + height - 1;
  painter.use(COLORS.rim);
  painter.rect(x + 2, y, width - 4, 1).rect(x + 2, bottom, width - 4, 1);
  painter.rect(x, y + 2, 1, height - 4).rect(right, y + 2, 1, height - 4);
  // a pixel set in at each corner rounds it
  painter.rect(x + 1, y + 1, 1, 1).rect(right - 1, y + 1, 1, 1);
  painter.rect(x + 1, bottom - 1, 1, 1).rect(right - 1, bottom - 1, 1, 1);
}

// a pane of dark glass with the road showing through, a gold rim, a sheen and a soft shadow
export function drawSummaryPanel(painter, { box, opacity }) {
  const { x, y, width, height } = box;
  painter.alpha(opacity * COLORS.shadowAlpha).use(COLORS.shadow);
  painter.rect(x + 2, y + height, width - 4, 2);
  painter.alpha(opacity * COLORS.glassAlpha).use(COLORS.glass);
  painter.rect(x + 1, y + 1, width - 2, height - 2);
  painter.alpha(opacity * COLORS.sheenAlpha).use(COLORS.sheen);
  painter.rect(x + 3, y + 1, width - 6, 1);
  painter.alpha(opacity * COLORS.rimAlpha);
  drawRim(painter, box);
  painter.alpha(1);
}

// the panel's name sits in a gap in its top rim
export function drawPanelLabel(painter, { text, box, opacity }) {
  const middle = box.x + box.width / 2;
  const width = textWidth(text, 1) + LABEL_PADDING * 2;
  const left = Math.round(middle - width / 2);
  painter
    .alpha(opacity)
    .use(COLORS.glass)
    .rect(left, box.y - 1, width, 3);
  drawText(painter, text, { x: middle, y: box.y - 2, color: COLORS.label, align: 'center' });
  painter.alpha(1);
}

// a faint gold rule across the panel
export function drawPanelRule(painter, { box, y, opacity }) {
  painter.alpha(opacity * COLORS.ruleAlpha).use(COLORS.rule);
  painter.rect(box.x + 12, y, box.width - 24, 1);
  painter.alpha(1);
}
