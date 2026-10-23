import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { ULT_FULL, ULT_MAX } from '../../config.js';
import { canAffordHeavy } from '../../sim/combat/ult-bar.js';
import { drawText } from '../text/draw-text.js';

const LABEL_WIDTH = 14;
const GAUGE_WIDTH = 64;
const GAUGE_HEIGHT = 5;
const HALF = GAUGE_WIDTH / 2;
const BLINK_TICKS = 24;

function gaugeRect({ x, y }) {
  return { x: x + LABEL_WIDTH, y, width: GAUGE_WIDTH, height: GAUGE_HEIGHT };
}

function fillColor(full, tickCount) {
  if (!full) {
    return HUD_COLORS.ultFill;
  }
  return (tickCount >> 2) & 1 ? COLORS.gold : COLORS.cream;
}

// each half holds one ultimate and fills after the one before it
function drawHalves(painter, game, gauge) {
  for (let half = 0; half < ULT_MAX / ULT_FULL; half++) {
    const share = Math.min(1, Math.max(0, (game.ultMeter - half * ULT_FULL) / ULT_FULL));
    const color = fillColor(share === 1, game.tickCount + half * 2);
    painter.use(color).rect(gauge.x + half * HALF, gauge.y, Math.round(HALF * share), gauge.height);
  }
  painter.use(COLORS.outline).rect(gauge.x + HALF - 1, gauge.y - 1, 2, gauge.height + 2);
}

function labelColor(game, ready) {
  if (ready) {
    return COLORS.gold;
  }
  return canAffordHeavy(game) ? COLORS.lilac : HUD_COLORS.barTrough;
}

function outlineAround(painter, gauge) {
  painter.outline(gauge.x - 2, gauge.y - 2, gauge.width + 4, gauge.height + 4);
}

// a heavy pressed with too little bar makes the gauge blink red
function drawRefusal(painter, game, gauge) {
  const since = game.tickCount - game.heavyRefusedAt;
  if (since < BLINK_TICKS && (since >> 2) % 2 === 0) {
    outlineAround(painter.use(COLORS.red), gauge);
  }
}

function drawReady(painter, game, gauge) {
  const { tickCount } = game;
  const text = game.ultMeter >= ULT_MAX ? 'x2' : 'READY';
  drawText(painter, (tickCount >> 4) & 1 ? text : '', {
    x: gauge.x + gauge.width + 4,
    y: gauge.y,
    color: COLORS.gold,
  });
  if ((tickCount >> 2) & 1) {
    outlineAround(painter.alpha(0.5).use(COLORS.gold), gauge);
    painter.alpha(1);
  }
}

export function drawUltGauge(painter, game, origin) {
  const ready = game.ultMeter >= ULT_FULL;
  const gauge = gaugeRect(origin);
  drawText(painter, 'ULT', { x: origin.x, y: origin.y, color: labelColor(game, ready) });
  painter.use(COLORS.outline).rect(gauge.x - 1, gauge.y - 1, gauge.width + 2, gauge.height + 2);
  painter.use(HUD_COLORS.barBack).rect(gauge.x, gauge.y, gauge.width, gauge.height);
  drawHalves(painter, game, gauge);
  if (ready) {
    drawReady(painter, game, gauge);
  }
  drawRefusal(painter, game, gauge);
}
