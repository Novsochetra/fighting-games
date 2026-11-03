import { drawWave } from '../../duel/looks/water.js';
import { river } from './lines.js';

// the water rises behind the ball near the camera into a wave and comes curling after it toward
// the goal
export function wave(pen, options) {
  const { points, art, tick } = options;
  const near = points[0];
  const ball = points.at(-1);
  const height = Math.min(60, 12 + (near.y - ball.y) * 0.9);

  drawWave(pen, {
    x: near.x + 30,
    ground: near.y + near.radius * 2,
    height,
    length: 120,
    art,
    tick,
  });
  river(pen, options);
}
