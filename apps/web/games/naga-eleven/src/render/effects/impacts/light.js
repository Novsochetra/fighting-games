import { noise } from '../noise.js';
import { drawLine } from '../paint.js';

// out fast, then fading slowly
const swellOf = (share) => (share < 0.2 ? share / 0.2 : 1 - (share - 0.2) / 0.8);

// a star of light: a long cross, shorter diagonals, a white heart and a ring of sparkles
export function drawBurst(context, { at, art, share, scale }) {
  const x = Math.round(at.x);
  const y = Math.round(at.y);
  const long = Math.max(2, Math.round((10 + 22 * swellOf(share)) * scale));
  const short = Math.round(long * 0.5);

  context.globalAlpha = 1 - share * 0.5;
  context.fillStyle = art.body[2];
  context.fillRect(x - long, y - 1, long * 2 + 1, 3);
  context.fillRect(x - 1, y - long, 3, long * 2 + 1);
  context.fillStyle = art.body[3];
  context.fillRect(x - Math.round(long * 0.6), y - 2, Math.round(long * 1.2) + 1, 5);
  context.fillRect(x - 2, y - Math.round(long * 0.6), 5, Math.round(long * 1.2) + 1);
  context.fillStyle = art.body[4];
  context.fillRect(x - long, y, long * 2 + 1, 1);
  context.fillRect(x, y - long, 1, long * 2 + 1);
  context.fillStyle = art.body[3];

  for (let reach = 2; reach <= short; reach += 2) {
    context.fillRect(x - reach, y - reach, 1, 1);
    context.fillRect(x + reach, y - reach, 1, 1);
    context.fillRect(x - reach, y + reach, 1, 1);
    context.fillRect(x + reach, y + reach, 1, 1);
  }

  if (share < 0.4) {
    context.fillStyle = art.body[4];
    context.fillRect(x - 3, y - 3, 7, 7);
  }

  drawSparkleRing(context, { x, y, art, share, scale });
  context.globalAlpha = 1;
}

function drawSparkleRing(context, { x, y, art, share, scale }) {
  const radius = (8 + 30 * share) * scale;

  context.fillStyle = art.accent[3];

  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2 + 0.4;

    context.fillRect(
      Math.round(x + Math.cos(angle) * radius),
      Math.round(y + Math.sin(angle) * radius * 0.8),
      2,
      i % 2 ? 1 : 2,
    );
  }
}

// sparks flung out round the point, falling as they fly, each with a short tail
export function drawSparks(context, { at, art, age, share, scale, seed }) {
  context.globalAlpha = 1 - share * 0.7;

  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2 + noise(seed, i) * 0.5;
    const speed = (2 + noise(seed, i + 12) * 2.6) * scale;
    const fly = (step) => ({
      x: Math.round(at.x + Math.cos(angle) * speed * step),
      y: Math.round(at.y + Math.sin(angle) * speed * step * 0.8 + 0.05 * step * step),
    });
    const head = fly(age);
    const tail = fly(Math.max(0, age - 3));

    context.fillStyle = art.body[2];
    drawLine(context, tail, head, 1);
    context.fillStyle = i % 3 ? art.body[4] : art.accent[3];
    context.fillRect(head.x - 1, head.y, 2, i % 4 ? 1 : 2);
  }

  context.globalAlpha = 1;
}
