import { drawBanner, drawBossBar, drawGoArrow, drawOffscreenArrows } from './alerts.js';
import { drawCombo } from './combo.js';
import { drawFrameData } from './frame-data.js';
import { drawPlayerPanel } from './player-panel.js';
import { drawScore } from './score.js';

export function drawHud(painter, game, view) {
  drawPlayerPanel(painter, game, view);
  drawScore(painter, game, view);
  drawCombo(painter, game);
  drawBossBar(painter, game.boss);
  drawGoArrow(painter, game);
  drawOffscreenArrows(painter, game);
  drawBanner(painter, game.banner);
  if (game.settings.hitboxes) {
    drawFrameData(painter, game);
  }
}
