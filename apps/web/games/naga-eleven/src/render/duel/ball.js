import { BALL_FRAMES, BALL_PALETTE } from '../../art/duel/ball.js';
import { drawGrid } from './grid.js';

// the ball spins a turn every few ticks; x and y are its middle
export function drawBall(pen, { x, y, tick, spin = 3 }) {
  const rows = BALL_FRAMES[Math.floor(tick / spin) % BALL_FRAMES.length];

  drawGrid(pen, { rows, palette: BALL_PALETTE, x: Math.round(x) - 5, y: Math.round(y) - 5 });
}

export const BALL_RADIUS = 5.5;
