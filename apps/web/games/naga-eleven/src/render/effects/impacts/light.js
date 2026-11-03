import { noise } from '../noise.js';
import { drawLine } from '../paint.js';

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
