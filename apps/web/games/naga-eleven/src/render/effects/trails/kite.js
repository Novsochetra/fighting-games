import { KITE } from '../maps.js';
import { paletteOf } from '../move-plan.js';
import { across, drawLine } from '../paint.js';
import { paintMap } from '../pixel-map.js';
import { drawBand } from './band.js';

const RIDE = 12;

// a khleng kite riding over the ball, its tail of ribbon waving back along the path, bows on it
export function drawKite(context, trail) {
  const { samples, art, head, tick, alpha } = trail;
  const bob = Math.floor(tick / 8) % 2;
  const foot = { x: head.x, y: head.y - RIDE + bob };

  context.globalAlpha = alpha * 0.4;
  drawBand(context, samples, { colour: art.body[2], thickness: (sample) => 1 + sample.t * 2 });
  context.globalAlpha = alpha;
  drawTail(context, trail, foot);
  paintMap(context, KITE, { ...foot, palette: paletteOf(art), flip: trail.flip, bake: trail.bake });
  context.globalAlpha = 1;
}

function drawTail(context, trail, foot) {
  const { samples, art, tick } = trail;
  let last = foot;

  for (let i = samples.length - 1; i >= 0; i -= 1) {
    const sample = samples[i];
    const normal = across(sample);
    const lift = (1 - sample.t) * 4 + RIDE * sample.t;
    const wave = Math.sin(sample.t * 9 + tick * 0.3) * 3 * (1 - sample.t);
    const point = {
      x: Math.round(sample.x + normal.x * wave),
      y: Math.round(sample.y - lift + normal.y * wave),
    };

    context.fillStyle = art.accent[2];
    drawLine(context, last, point);

    if (i % 4 === 2) {
      context.fillStyle = art.accent[3];
      context.fillRect(point.x - 1, point.y - 1, 3, 1);
      context.fillRect(point.x - 1, point.y + 1, 3, 1);
    }

    last = point;
  }
}
