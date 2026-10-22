import { FX_SPRITES } from '../../data/fx-sprites.js';
import { clamp } from '../../lib/math.js';
import { drawFxFrame } from './fx-sheets.js';
import { drawLandingShadow } from './rock-hazards.js';

const SPREAD_TICKS = 10;
const DRY_TICKS = 30;

// the spot each glob will land on is marked from the moment it leaves her mouth
export function drawGlob(painter, glob, sheets) {
  drawLandingShadow(painter, { ...glob.landing, y: glob.y, time: glob.time });
  const { frames, ticks } = FX_SPRITES.glob;
  drawFxFrame(painter, sheets, {
    name: 'glob',
    frame: Math.floor(glob.time / ticks) % frames,
    x: glob.x,
    y: glob.y,
    facing: glob.direction,
  });
}

// a puddle spreads out where the glob lands, bubbles while it lasts and fades as it dries
export function drawPuddle(painter, puddle, sheets) {
  const { frames, ticks } = FX_SPRITES.puddle;
  painter.alpha(clamp((puddle.life - puddle.time) / DRY_TICKS, 0, 1));
  drawFxFrame(painter, sheets, {
    name: 'puddle',
    frame: Math.floor(puddle.time / ticks) % frames,
    x: puddle.x,
    y: puddle.y,
    scale: clamp(0.4 + puddle.time / SPREAD_TICKS, 0.4, 1),
    facing: puddle.direction,
  });
  painter.alpha(1);
}
