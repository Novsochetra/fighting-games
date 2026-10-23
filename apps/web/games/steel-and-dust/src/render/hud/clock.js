import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { currentZone } from '../../sim/stage/mission.js';
import { drawText, textWidth } from '../text/draw-text.js';
import { drawPlaque } from './hud-frames.js';
import { LOWER_BOX, TOP_BAR_HEIGHT } from './top-bar.js';

const DIGIT_SCALE = 2;
const PADDING = 6;
// wide enough for any clock under 100 minutes, so the plaque keeps still as the minutes pass
const MIN_CLOCK_WIDTH = 50;

export function formatClock(ticks) {
  const seconds = Math.floor(ticks / 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function waveText(game) {
  const { waveIndex } = game.stage;
  const zone = currentZone(game);
  if (!game.arena || !zone || zone.boss || waveIndex < 0) {
    return null;
  }
  return `WAVE ${Math.min(waveIndex + 1, zone.waves.length)}/${zone.waves.length}`;
}

function centeredBox({ width, y, height }) {
  return { x: Math.round((VIEW_WIDTH - width) / 2), y, width, height };
}

export function clockPlaque(text) {
  const width = Math.max(MIN_CLOCK_WIDTH, textWidth(text, DIGIT_SCALE) + PADDING * 2);
  return centeredBox({ width, y: 0, height: TOP_BAR_HEIGHT });
}

function drawWave(painter, game, view) {
  const text = waveText(game);
  if (!text) {
    return;
  }
  const box = centeredBox({ width: textWidth(text, 1) + PADDING * 2, ...LOWER_BOX });
  drawPlaque(painter, view.hudFrames, 'score', box);
  drawText(painter, text, { x: VIEW_WIDTH / 2, y: box.y + 5, color: COLORS.sand, align: 'center' });
}

// the run's clock in the middle of the top, an arcade timer with no label
export function drawClock(painter, game, view) {
  const text = formatClock(game.playTime);
  drawPlaque(painter, view.hudFrames, 'score', clockPlaque(text));
  const digitsTop = (TOP_BAR_HEIGHT - 5 * DIGIT_SCALE) / 2;
  drawText(painter, text, {
    x: VIEW_WIDTH / 2,
    y: digitsTop,
    color: COLORS.sand,
    scale: DIGIT_SCALE,
    align: 'center',
  });
  drawWave(painter, game, view);
}
