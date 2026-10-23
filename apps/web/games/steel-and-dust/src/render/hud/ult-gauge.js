import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { ULT_FULL, ULT_MAX } from '../../config.js';
import { canAffordHeavy } from '../../sim/combat/ult-bar.js';
import { drawText } from '../text/draw-text.js';

const GAUGE = { x: 22, y: 37, width: 70, height: 5 };
const HALF = GAUGE.width / 2;
const BLINK_TICKS = 24;

function fillColor(full, tickCount) {
  if (!full) {
    return HUD_COLORS.ultFill;
  }
  return (tickCount >> 2) & 1 ? COLORS.gold : COLORS.cream;
}

// each half holds one ultimate and fills after the one before it
function drawHalves(painter, game) {
  for (let half = 0; half < ULT_MAX / ULT_FULL; half++) {
    const share = Math.min(1, Math.max(0, (game.ultMeter - half * ULT_FULL) / ULT_FULL));
    const color = fillColor(share === 1, game.tickCount + half * 2);
    painter.use(color).rect(GAUGE.x + half * HALF, GAUGE.y, Math.round(HALF * share), GAUGE.height);
  }
  painter.use(COLORS.outline).rect(GAUGE.x + HALF - 1, GAUGE.y - 1, 2, GAUGE.height + 2);
}

function labelColor(game, ready) {
  if (ready) {
    return COLORS.gold;
  }
  return canAffordHeavy(game) ? COLORS.lilac : HUD_COLORS.barTrough;
}

// a heavy pressed with too little bar makes the gauge blink red
function drawRefusal(painter, game) {
  const since = game.tickCount - game.heavyRefusedAt;
  if (since < BLINK_TICKS && (since >> 2) % 2 === 0) {
    painter.use(COLORS.red).outline(GAUGE.x - 2, GAUGE.y - 2, GAUGE.width + 4, GAUGE.height + 4);
  }
}

function drawReady(painter, game) {
  const { tickCount } = game;
  const text = game.ultMeter >= ULT_MAX ? 'x2' : 'READY';
  drawText(painter, (tickCount >> 4) & 1 ? text : '', { x: 96, y: 37, color: COLORS.gold });
  if ((tickCount >> 2) & 1) {
    painter
      .alpha(0.5)
      .use(COLORS.gold)
      .outline(GAUGE.x - 2, GAUGE.y - 2, 74, 9);
    painter.alpha(1);
  }
}

export function drawUltGauge(painter, game) {
  const ready = game.ultMeter >= ULT_FULL;
  drawText(painter, 'ULT', { x: 6, y: 37, color: labelColor(game, ready) });
  painter.use(COLORS.outline).rect(GAUGE.x - 1, GAUGE.y - 1, GAUGE.width + 2, GAUGE.height + 2);
  painter.use(HUD_COLORS.barBack).rect(GAUGE.x, GAUGE.y, GAUGE.width, GAUGE.height);
  drawHalves(painter, game);
  if (ready) {
    drawReady(painter, game);
  }
  drawRefusal(painter, game);
}
