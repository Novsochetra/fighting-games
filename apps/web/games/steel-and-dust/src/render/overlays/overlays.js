import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { GROUND_Y, VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';
import { ULTIMATE } from '../../data/ultimate.js';
import { drawText, textWidth } from '../text/draw-text.js';

function drawUltCutIn(painter, game) {
  const elapsed = ULTIMATE.intro - game.ultFreeze;
  const slide = Math.max(0, 1 - elapsed / 8);
  const y = 60;
  painter.alpha(0.85).use(HUD_COLORS.cutInBand).rect(0, y, VIEW_WIDTH, 34);
  painter.alpha(1).use(COLORS.gold).rect(0, y, VIEW_WIDTH, 1);
  painter.use(COLORS.gold).rect(0, y + 33, VIEW_WIDTH, 1);
  for (let i = 0; i < 6; i++) {
    const streak = ((game.tickCount * 9 + i * 71) % (VIEW_WIDTH + 60)) - 30;
    painter.use(HUD_COLORS.cutInStreak).rect(VIEW_WIDTH - streak, y + 5 + i * 4, 22, 1);
  }
  drawText(painter, 'ultimate', {
    x: VIEW_WIDTH / 2 + slide * VIEW_WIDTH,
    y: y + 5,
    color: COLORS.sand,
    align: 'center',
  });
  drawText(painter, ULTIMATE.name, {
    x: VIEW_WIDTH / 2 - slide * VIEW_WIDTH,
    y: y + 14,
    color: COLORS.gold,
    scale: 3,
    align: 'center',
  });
}

function hintOpacity(time) {
  if (time < 10) {
    return time / 10;
  }
  return time > 220 ? (240 - time) / 20 : 1;
}

// a tip for new players, just under the health panel and clear of the action
function drawHint(painter, game) {
  const { hint, device } = game;
  const text = (device.touchUsed || device.coarsePointer ? hint.touch : hint.keys).toUpperCase();
  const width = textWidth(text, 1);
  const alpha = hintOpacity(hint.time);
  const y = 54;
  painter
    .alpha(0.75 * alpha)
    .use(COLORS.night)
    .rect(VIEW_WIDTH / 2 - width / 2 - 6, y - 4, width + 12, 13);
  painter
    .alpha(alpha)
    .use(COLORS.amber)
    .outline(VIEW_WIDTH / 2 - width / 2 - 6, y - 4, width + 12, 13);
  drawText(painter, text, { x: VIEW_WIDTH / 2, y, color: COLORS.butter, align: 'center' });
  painter.alpha(1);
}

export function drawScreenFlashes(painter, game) {
  if (game.slashBandTime > 0) {
    const height = game.slashBandTime;
    const y = GROUND_Y - 22 - height / 2;
    painter.use(COLORS.gold).rect(0, y - 1, VIEW_WIDTH, height + 2);
    painter.use(COLORS.white).rect(0, y + 1, VIEW_WIDTH, Math.max(1, height - 2));
  }
  if (game.flashTime > 0 && game.settings.flash) {
    painter
      .alpha(game.flashTime / 18)
      .use(HUD_COLORS.flash)
      .rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    painter.alpha(1);
  }
}

// the fade-in counts down here, once per drawn frame, as it always has
export function drawOverlays(painter, game) {
  if (game.ultFreeze > 0) {
    drawUltCutIn(painter, game);
  }
  if (game.hint && game.mode === 'play' && game.ultFreeze <= 0) {
    drawHint(painter, game);
  }
  if (game.fadeIn > 0) {
    painter
      .alpha(game.fadeIn / 24)
      .use(COLORS.night)
      .rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    painter.alpha(1);
    game.fadeIn--;
  }
  if (game.mode === 'title') {
    painter.alpha(0.35).use(COLORS.night).rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    painter.alpha(1);
  }
  if (game.muted && game.mode === 'play') {
    drawText(painter, 'MUTED', {
      x: VIEW_WIDTH / 2,
      y: VIEW_HEIGHT - 8,
      color: COLORS.lilac,
      align: 'center',
    });
  }
}
