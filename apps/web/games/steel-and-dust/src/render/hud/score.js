import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { currentZone } from '../../sim/stage/mission.js';
import { drawText, textWidth } from '../text/draw-text.js';

const RIGHT = VIEW_WIDTH - 6;

// the shown score counts up toward the real one
function easeScore(view, score) {
  if (view.shownScore > score) {
    view.shownScore = score;
  } else {
    view.shownScore += Math.ceil((score - view.shownScore) * 0.18);
  }
  return view.shownScore;
}

export function formatClock(ticks) {
  const seconds = Math.floor(ticks / 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function drawScore(painter, game, view) {
  const shown = easeScore(view, game.score);
  drawText(painter, `SCORE ${String(shown).padStart(7, '0')}`, {
    x: RIGHT,
    y: 6,
    color: COLORS.sand,
    align: 'right',
  });
  drawText(painter, `TIME ${formatClock(game.playTime)}`, {
    x: RIGHT,
    y: 14,
    color: COLORS.lilac,
    align: 'right',
  });
  if (game.records.bestCombo) {
    drawText(painter, `BEST ${game.records.bestCombo} HITS`, {
      x: RIGHT,
      y: 22,
      color: COLORS.lilac,
      align: 'right',
    });
  }
}

export function drawWaveLabel(painter, game) {
  const { waveIndex } = game.stage;
  const zone = currentZone(game);
  if (!game.arena || !zone || zone.boss || waveIndex < 0) {
    return;
  }
  const label = `${zone.label}  wave ${Math.min(waveIndex + 1, zone.waves.length)}/${zone.waves.length}`;
  const width = textWidth(label.toUpperCase(), 1);
  painter
    .alpha(0.5)
    .use(COLORS.night)
    .rect(VIEW_WIDTH / 2 - width / 2 - 4, 3, width + 8, 10);
  painter.alpha(1);
  drawText(painter, label, { x: VIEW_WIDTH / 2, y: 5, color: COLORS.sand, align: 'center' });
}
