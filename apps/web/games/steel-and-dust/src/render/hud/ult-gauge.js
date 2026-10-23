import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { ULT_FULL, ULT_MAX } from '../../config.js';

const GAUGE_HEIGHT = 5;
const BLINK_TICKS = 24;

function fillColor(full, tickCount) {
  if (!full) {
    return HUD_COLORS.ultFill;
  }
  return (tickCount >> 2) & 1 ? COLORS.gold : COLORS.cream;
}

// each half holds one ultimate and fills after the one before it
function drawHalves(painter, game, gauge) {
  const half = gauge.width / 2;
  for (let index = 0; index < ULT_MAX / ULT_FULL; index++) {
    const share = Math.min(1, Math.max(0, (game.ultMeter - index * ULT_FULL) / ULT_FULL));
    const color = fillColor(share === 1, game.tickCount + index * 2);
    painter
      .use(color)
      .rect(gauge.x + index * half, gauge.y, Math.round(half * share), gauge.height);
  }
  painter.use(COLORS.outline).rect(gauge.x + half - 1, gauge.y - 1, 2, gauge.height + 2);
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

// a full half flashes and the gauge pulses gold, so it needs no READY beside it
function drawReady(painter, game, gauge) {
  if (game.ultMeter >= ULT_FULL && (game.tickCount >> 2) & 1) {
    outlineAround(painter.alpha(0.5).use(COLORS.gold), gauge);
    painter.alpha(1);
  }
}

export function drawUltGauge(painter, game, { x, y, width }) {
  const gauge = { x, y, width, height: GAUGE_HEIGHT };
  painter.use(COLORS.outline).rect(x - 1, y - 1, width + 2, GAUGE_HEIGHT + 2);
  painter.use(HUD_COLORS.barBack).rect(x, y, width, GAUGE_HEIGHT);
  drawHalves(painter, game, gauge);
  drawReady(painter, game, gauge);
  drawRefusal(painter, game, gauge);
}
