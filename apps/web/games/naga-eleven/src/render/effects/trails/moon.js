import { noise } from '../noise.js';
import { across } from '../paint.js';
import { drawBand } from './band.js';
import { crescentAt, drawCrescent } from './crescent.js';

const wayOf = (trail) => trail.samples.at(-1) ?? { dx: trail.flip ? -1 : 1, dy: 0 };

function drawStars(context, trail, count) {
  const { samples, art, tick } = trail;

  for (let i = 0; i < count && samples.length > 0; i += 1) {
    const sample = samples[Math.floor(noise(trail.seed, i) * samples.length)];
    const normal = across(sample);
    const off = (noise(trail.seed, i + 20) - 0.5) * 18;
    const x = Math.round(sample.x + normal.x * off);
    const y = Math.round(sample.y + normal.y * off);
    const twinkle = (Math.floor(tick / 4) + i) % 3;

    context.fillStyle = art.body[4];
    context.fillRect(x, y, 1, 1);

    if (twinkle === 0) {
      context.fillStyle = art.body[3];
      context.fillRect(x - 1, y, 3, 1);
      context.fillRect(x, y - 1, 1, 3);
    }
  }
}

// Silent Moon: a crescent riding the ball, the ball in its hollow, a night sky of stars behind
export function drawArc(context, trail) {
  const { art, head, alpha } = trail;
  const way = wayOf(trail);
  const back = { x: head.x - way.dx * 3, y: head.y - way.dy * 3 };
  const toward = { x: way.dx, y: way.dy };

  context.globalAlpha = alpha * 0.5;
  drawBand(context, trail.samples, {
    colour: art.body[1],
    thickness: (sample) => 2 + sample.t * 4,
  });
  context.globalAlpha = alpha;
  drawStars(context, trail, 7);
  drawCrescent(context, crescentAt(back, toward, { radius: 9, bite: 5, hollow: 8 }), art.body[1]);
  drawCrescent(context, crescentAt(back, toward, { radius: 8, bite: 5, hollow: 8 }), art.body[3]);
  drawCrescent(context, crescentAt(back, toward, { radius: 7, bite: 6, hollow: 8 }), art.body[4]);
  context.globalAlpha = 1;
}

// Preah Khan Strike: a blade's edge along the path and a wide slash of steel behind the ball,
// flashing, with gold glints where it ends
export function drawBlade(context, trail) {
  const { art, head, alpha, tick } = trail;
  const way = wayOf(trail);
  const toward = { x: way.dx, y: way.dy };
  const back = { x: head.x - way.dx * 8, y: head.y - way.dy * 8 };
  const flash = Math.floor(tick / 3) % 2 === 0 ? 1 : 0.7;

  context.globalAlpha = alpha * 0.55;
  drawBand(context, trail.samples, {
    colour: art.body[2],
    thickness: (sample) => 1 + sample.t * 3,
  });
  context.globalAlpha = alpha;
  drawBand(context, trail.samples, { colour: art.body[4], thickness: () => 1, from: 0.3 });
  context.globalAlpha = alpha * flash;
  drawCrescent(context, crescentAt(back, toward, { radius: 17, bite: 5, hollow: 16 }), art.body[2]);
  drawCrescent(context, crescentAt(back, toward, { radius: 16, bite: 6, hollow: 16 }), art.body[4]);
  drawBladeTips(context, back, toward, art);
  context.globalAlpha = 1;
}

function drawBladeTips(context, back, toward, art) {
  const normal = { x: -toward.y, y: toward.x };

  context.fillStyle = art.accent[3];

  for (const side of [-1, 1]) {
    const x = Math.round(back.x + normal.x * side * 15 + toward.x * 5);
    const y = Math.round(back.y + normal.y * side * 15 + toward.y * 5);

    context.fillRect(x - 1, y, 3, 1);
    context.fillRect(x, y - 1, 1, 3);
  }
}
