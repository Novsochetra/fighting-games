import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { VIEW_HEIGHT } from '../../config.js';
import { drawText } from '../text/draw-text.js';

const BUFFER_LABEL = { light: 'L', heavy: 'K' };

function phaseColor(move, frame) {
  if (frame < move.startup) {
    return HUD_COLORS.frameStartup;
  }
  return frame < move.startup + move.active ? COLORS.red : HUD_COLORS.frameRecovery;
}

function drawMoveTimeline(painter, player) {
  const move = player.move;
  const total = move.startup + move.active + move.recovery;
  const width = total > 45 ? 1 : 2;
  drawText(painter, `${move.name}  ${move.startup}/${move.active}/${move.recovery}`, {
    x: 6,
    y: VIEW_HEIGHT - 22,
    color: COLORS.sand,
  });
  for (let i = 0; i < total; i++) {
    painter.use(phaseColor(move, i)).rect(6 + i * width, VIEW_HEIGHT - 14, width, 5);
  }
  painter
    .use(COLORS.white)
    .rect(6 + Math.min(player.moveTime, total - 1) * width, VIEW_HEIGHT - 16, width, 9);
}

// with Training tools on: the current move's startup, active and recovery frames
export function drawFrameData(painter, game) {
  const player = game.player;
  drawText(painter, 'HITBOX VIEW', { x: 6, y: VIEW_HEIGHT - 30, color: COLORS.mint });
  if (player.state === 'attack' && player.move) {
    drawMoveTimeline(painter, player);
  } else {
    drawText(painter, `state: ${player.state}`, { x: 6, y: VIEW_HEIGHT - 22, color: COLORS.sand });
  }
  const buffer = game.input.buffer;
  if (buffer.action) {
    const label = BUFFER_LABEL[buffer.action] ?? buffer.action;
    drawText(painter, `buffer: ${label} ${buffer.ttl}`, {
      x: 120,
      y: VIEW_HEIGHT - 22,
      color: COLORS.butter,
    });
  }
}
