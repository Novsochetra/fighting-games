import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { currentZone } from '../../sim/stage/mission.js';
import { drawText, textWidth } from '../text/draw-text.js';
import { drawHudFrame } from './hud-frames.js';

const RIGHT = VIEW_WIDTH - 8;
const LINE_HEIGHT = 8;

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

function scoreLines(game, shown) {
  const lines = [
    { text: `SCORE ${String(shown).padStart(7, '0')}`, color: COLORS.sand },
    { text: `TIME ${formatClock(game.playTime)}`, color: COLORS.lilac },
  ];
  if (game.records.bestCombo) {
    lines.push({ text: `BEST ${game.records.bestCombo} HITS`, color: COLORS.lilac });
  }
  return lines;
}

// the plaque fits its widest line and its number of lines, flush with the top right corner
export function scorePlaque(lines) {
  const width = Math.max(...lines.map(({ text }) => textWidth(text, 1))) + 16;
  return { x: VIEW_WIDTH - width, y: 0, width, height: lines.length * LINE_HEIGHT + 10 };
}

export function drawScore(painter, game, view) {
  const lines = scoreLines(game, easeScore(view, game.score));
  const plaque = scorePlaque(lines);
  painter
    .alpha(0.55)
    .use(COLORS.night)
    .rect(plaque.x + 2, 2, plaque.width - 4, plaque.height - 4);
  painter.alpha(1);
  drawHudFrame(painter, view.hudFrames, 'score', plaque);
  lines.forEach(({ text, color }, i) => {
    drawText(painter, text, { x: RIGHT, y: 8 + i * LINE_HEIGHT, color, align: 'right' });
  });
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
