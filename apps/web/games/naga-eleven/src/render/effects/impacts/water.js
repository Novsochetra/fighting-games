import { drawDashedEllipse } from '../ellipse.js';
import { noise } from '../noise.js';

const GRAVITY = 0.14;

function drawDrops(context, { at, ground, art, age, scale, seed }) {
  for (let i = 0; i < 18; i += 1) {
    const across = (noise(seed, i) - 0.5) * 4.4 * scale;
    const lift = (1.6 + noise(seed, i + 9) * 2.8) * scale;
    const x = Math.round(at.x + across * age);
    const y = Math.round(at.y - (lift * age - GRAVITY * age * age));

    if (y <= ground.y + 2) {
      const size = i % 3 === 0 ? 3 : 2;

      context.fillStyle = art.body[2];
      context.fillRect(x, y + 1, size, size);
      context.fillStyle = [art.body[4], art.body[3], art.accent[3]][i % 3];
      context.fillRect(x, y, size, size);
    }
  }
}

function drawCrown(context, { at, art, share, scale, seed }) {
  const rise = Math.sin(Math.PI * Math.min(1, share * 1.6));

  for (let i = 0; i < 9; i += 1) {
    const middle = 1 - Math.abs(i - 4) / 5;
    const height = Math.round((8 + noise(seed, i + 30) * 8) * (0.5 + middle) * rise * scale);
    const x = Math.round(at.x + (i - 4) * 3 * scale);

    if (height > 0) {
      context.fillStyle = art.body[2];
      context.fillRect(x, Math.round(at.y) - height, 3, height);
      context.fillStyle = art.body[3];
      context.fillRect(x, Math.round(at.y) - height, 2, height);
      context.fillStyle = art.body[4];
      context.fillRect(x, Math.round(at.y) - height, 2, 2);
    }
  }
}

// water thrown up: a crown of it, drops flung out and falling, a ripple running out on the grass
export function drawSplash(context, impact) {
  const { ground, art, share, scale } = impact;

  context.globalAlpha = 1 - share * 0.6;
  drawDashedEllipse(context, {
    x: ground.x,
    y: ground.y,
    radiusX: (8 + 34 * share) * scale,
    radiusY: (3 + 10 * share) * scale,
    count: 26,
    size: 3,
    colour: art.body[3],
    back: art.body[2],
  });
  drawCrown(context, impact);
  drawDrops(context, impact);
  context.globalAlpha = 1;
}

// feathers burst out and drift down, swaying, turning as they fall
export function drawFeathers(context, { at, art, age, share, scale, seed }) {
  const spread = Math.min(1, share * 3);

  context.globalAlpha = 1 - share * 0.6;

  for (let i = 0; i < 10; i += 1) {
    const sway = Math.sin(age / 5 + i) * 3;
    const x = Math.round(at.x + (noise(seed, i) - 0.5) * 34 * spread * scale + sway);
    const y = Math.round(at.y - (noise(seed, i + 7) * 14 * spread - age * 0.45) * scale);
    const isFlat = (Math.floor(age / 5) + i) % 2 === 0;

    context.fillStyle = art.body[3];
    context.fillRect(x, y, isFlat ? 3 : 1, isFlat ? 1 : 3);
    context.fillStyle = i % 2 ? art.accent[2] : art.body[4];
    context.fillRect(x, y, 1, 1);
  }

  context.globalAlpha = 1;
}
