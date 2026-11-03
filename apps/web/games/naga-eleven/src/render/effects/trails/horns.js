import { drawPixelEllipse } from '../../actors/shadow.js';
import { noise } from '../noise.js';
import { across } from '../paint.js';
import { blockBetween } from './band.js';

// the horns run back from the ball over the newest part of the path, spreading and curling in
const REACH = 0.6;

function hornOf(trail, side) {
  const from = 1 - REACH;

  return trail.samples
    .filter((sample) => sample.t >= from)
    .map((sample) => {
      const back = (1 - sample.t) / REACH;
      const normal = across(sample);
      const spread = Math.sin(Math.PI * back * 0.8) * 15 * side;

      return {
        ...sample,
        x: sample.x + normal.x * spread,
        y: sample.y + normal.y * spread,
        width: 1 + (1 - back) * 4,
      };
    });
}

function drawHorn(context, horn, art) {
  for (const [colour, grow, shift] of [
    [art.accent[0], 2, 0],
    [art.accent[2], 0, 0],
    [art.accent[3], -99, 1],
  ]) {
    context.fillStyle = colour;

    for (let i = 0; i < horn.length - 1; i += 1) {
      const width = Math.max(1, horn[i].width + grow);

      blockBetween(context, horn[i], horn[i + 1], { width, shift: shift * (horn[i].width / 2) });
    }
  }
}

// the Kouprey Kick: two horns of old ivory charging behind the ball, dust thrown up behind them
export function drawHorns(context, trail) {
  const { art, samples, tick, alpha } = trail;

  for (let i = 0; i < samples.length; i += 4) {
    const sample = samples[i];
    const size = 2 + (1 - sample.t) * 4 + noise(i, tick >> 3) * 2;

    context.globalAlpha = alpha * (0.45 + sample.t * 0.45);
    context.fillStyle = art.body[i % 8 === 0 ? 3 : 2];
    drawPixelEllipse(context, {
      x: sample.x,
      y: sample.y + 2 - (1 - sample.t) * 6,
      radiusX: size,
      radiusY: size * 0.75,
    });
  }

  context.globalAlpha = alpha;
  drawHorn(context, hornOf(trail, 1), art);
  drawHorn(context, hornOf(trail, -1), art);
  context.globalAlpha = 1;
}
