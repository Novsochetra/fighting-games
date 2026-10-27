import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';
import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const { frameWidth, frames, ticks } = FX_SPRITES.moatWater;
const TILE = frameWidth * FX_SCALE;

// the painted surface is a seamless tile, laid edge to edge across the breach and cut off at its
// banks; deep water fills the rest down to the bottom of the view
function drawMoat(painter, sheets, { from, to, level }, frame) {
  const width = to - from;
  const depth = VIEW_HEIGHT - level;
  const context = painter.context;

  painter.use(FX_COLORS.moatDeep).rect(from, level, width, depth);
  context.save();
  context.beginPath();
  context.rect(from, level, width, depth);
  context.clip();
  for (let x = from; x < to; x += TILE) {
    drawFxFrame(painter, sheets, { name: 'moatWater', frame, x, y: level });
  }

  context.restore();
}

export function drawMoats(painter, sheets, { water, cameraX, tick }) {
  const frame = Math.floor(tick / ticks) % frames;

  for (const span of water ?? []) {
    if (span.to > cameraX && span.from < cameraX + VIEW_WIDTH) {
      drawMoat(painter, sheets, span, frame);
    }
  }
}
