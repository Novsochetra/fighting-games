import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { clamp } from '../../lib/math.js';

// a segmented gauge: the lag part shows damage just taken
export function drawBar(painter, { x, y, width, height, fraction, lag, color }) {
  painter.use(COLORS.outline).rect(x - 1, y - 1, width + 2, height + 2);
  painter.use(HUD_COLORS.barBack).rect(x, y, width, height);
  painter.use(HUD_COLORS.barLag).rect(x, y, Math.round(width * clamp(lag, 0, 1)), height);
  const filled = Math.round(width * clamp(fraction, 0, 1));
  painter.use(color).rect(x, y, filled, height);
  painter.alpha(0.35).use(COLORS.white).rect(x, y, filled, 1);
  painter.alpha(1);
  for (let i = 1; i < 10; i++) {
    painter.use(COLORS.outline).rect(x + Math.round((width * i) / 10), y, 1, height);
  }
}
