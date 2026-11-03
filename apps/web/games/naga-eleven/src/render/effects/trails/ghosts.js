import { project } from '../../camera.js';

// the ghosts stand this many ticks back along the run, the nearest the most solid
const GHOSTS = [
  { back: 4, alpha: 0.45 },
  { back: 8, alpha: 0.28 },
  { back: 12, alpha: 0.14 },
];

// a dribble's afterimages: the player himself, as he is now, where he was a moment ago. `drawAt`
// draws his sprite with its feet at a point of the view (draw-ghosts.js)
export function drawAfterimages(context, { camera, points, alpha, drawAt }) {
  for (const { back, alpha: ghost } of GHOSTS) {
    const point = points[points.length - 1 - back];

    if (point) {
      const foot = project(camera, point.x, point.y);

      context.globalAlpha = alpha * ghost;
      drawAt(context, foot);
    }
  }

  context.globalAlpha = 1;
}
