import { COLORS } from '../../art/colors.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';
import { drawText, textWidth } from '../text/draw-text.js';

const LABEL = 'Loading';
const SCALE = 2;
const FRAMES_PER_DOT = 20;

// the clock is held while a road loads, so the dots count drawn frames, not ticks; the label is
// placed for all three dots, so it holds still while they come and go
export function drawLoadingScreen(painter, view) {
  const dots = Math.floor(view.loadingFrames / FRAMES_PER_DOT) % 4;
  view.loadingFrames++;
  painter.use(COLORS.night).rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawText(painter, `${LABEL}${'.'.repeat(dots)}`, {
    x: Math.floor((VIEW_WIDTH - textWidth(`${LABEL}...`, SCALE)) / 2),
    y: (VIEW_HEIGHT - 5 * SCALE) / 2,
    color: COLORS.lilac,
    scale: SCALE,
  });
}
