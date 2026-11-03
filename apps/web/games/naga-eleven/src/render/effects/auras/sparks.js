import { drawDashedEllipse } from '../ellipse.js';
import { noise } from '../noise.js';

// a swirl of wind about the feet, two rings turning opposite ways, leaves lifting in it
export function drawSwirl(context, { foot, art, tick, strength, seed }) {
  context.globalAlpha = strength;

  for (const [lift, radiusX, turn] of [
    [1, 16, tick * 0.13],
    [-9, 11, -tick * 0.17],
  ]) {
    drawDashedEllipse(context, {
      x: foot.x,
      y: foot.y + lift,
      radiusX,
      radiusY: radiusX * 0.32,
      count: 12,
      size: 3,
      colour: art.body[4],
      back: art.body[2],
      turn,
    });
  }

  for (let i = 0; i < 4; i += 1) {
    const angle = tick * 0.1 + i * 1.6 + noise(seed, i);
    const up = ((tick + i * 9) % 36) / 36;

    context.fillStyle = i % 2 ? art.accent[2] : art.accent[3];
    context.fillRect(
      Math.round(foot.x + Math.cos(angle) * (10 + up * 6)),
      Math.round(foot.y - 4 - up * 26 + Math.sin(angle) * 3),
      2,
      1,
    );
  }

  context.globalAlpha = 1;
}

// a ring of light over his head, rays turning over it, a pale column of light behind him
export function drawHalo(context, { foot, height, art, tick, strength }) {
  const top = foot.y - height + 3;

  context.globalAlpha = strength * 0.16;
  context.fillStyle = art.body[4];
  context.fillRect(Math.round(foot.x) - 10, Math.round(top), 21, Math.round(height + 8));
  context.globalAlpha = strength;
  drawDashedEllipse(context, {
    x: foot.x,
    y: top,
    radiusX: 10,
    radiusY: 3,
    count: 18,
    colour: art.accent[3],
    back: art.accent[2],
  });
  context.fillStyle = art.accent[3];

  for (let i = 0; i < 4; i += 1) {
    const angle = tick * 0.06 + (i * Math.PI) / 2;
    const x = Math.round(foot.x + Math.cos(angle) * 12);
    const y = Math.round(top - 3 + Math.sin(angle) * 4);

    context.fillRect(x, y, 1, 1);
    context.fillRect(x, y - (i % 2 ? 2 : 1), 1, 1);
  }

  context.globalAlpha = 1;
}
