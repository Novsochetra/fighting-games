import { HUD_COLORS } from '../../art/hud-colors.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';

function strength(game) {
  const player = game.player;
  const lowHealth =
    player.hp > 0 && player.hp / player.maxHp <= 0.3
      ? 0.35 + 0.25 * Math.sin(game.tickCount * 0.12)
      : 0;
  return Math.max(lowHealth, (game.hurtFlash / 14) * (game.settings.flash ? 0.8 : 0.4));
}

function gradient(context, view) {
  if (!view.vignette) {
    const center = [VIEW_WIDTH / 2, VIEW_HEIGHT / 2];
    view.vignette = context.createRadialGradient(
      ...center,
      VIEW_HEIGHT * 0.35,
      ...center,
      VIEW_WIDTH * 0.62,
    );
    view.vignette.addColorStop(0, HUD_COLORS.vignetteClear);
    view.vignette.addColorStop(1, HUD_COLORS.vignetteRed);
  }
  return view.vignette;
}

// red edges when hurt or low on health
export function drawVignette(painter, game, view) {
  if (!game.player || game.mode === 'title') {
    return;
  }
  const alpha = strength(game);
  if (alpha <= 0.01) {
    return;
  }
  const context = painter.context;
  const fill = gradient(context, view);
  context.globalAlpha = Math.min(1, alpha);
  context.fillStyle = fill;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  context.globalAlpha = 1;
}
