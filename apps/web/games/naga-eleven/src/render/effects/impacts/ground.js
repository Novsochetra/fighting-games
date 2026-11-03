import { project } from '../../camera.js';
import { drawPixelEllipse } from '../../actors/shadow.js';
import { drawDashedEllipse } from '../ellipse.js';
import { noise } from '../noise.js';

// a shock ring running out across the grass, a second behind it, dust kicked up on the first
export function drawRing(context, { ground, art, share, scale, seed }) {
  const radius = (8 + 56 * share) * scale;

  context.globalAlpha = 1 - share;
  drawDashedEllipse(context, {
    x: ground.x,
    y: ground.y,
    radiusX: radius,
    radiusY: radius * 0.34,
    count: 34,
    size: 4,
    colour: art.body[4],
    back: art.body[3],
  });
  drawDashedEllipse(context, {
    x: ground.x,
    y: ground.y,
    radiusX: radius * 0.6,
    radiusY: radius * 0.2,
    count: 16,
    colour: art.body[3],
    back: art.body[2],
    turn: 0.2,
  });
  context.fillStyle = art.body[2];

  for (let i = 0; i < 6; i += 1) {
    const angle = noise(seed, i) * Math.PI * 2;

    context.fillRect(
      Math.round(ground.x + Math.cos(angle) * radius),
      Math.round(ground.y + Math.sin(angle) * radius * 0.34 - share * 6),
      1,
      1,
    );
  }

  context.globalAlpha = 1;
}

// a cloud of dust in the move's colours, puffing out and settling
export function drawDustCloud(context, { ground, art, share, scale, seed, puffs = 6 }) {
  context.globalAlpha = (1 - share) * 0.8;

  for (let i = 0; i < puffs; i += 1) {
    const radius = (4 + share * 7) * scale * (0.7 + noise(seed, i + 3) * 0.5);

    context.fillStyle = art.body[[2, 3, 2, 4, 3, 2][i]];
    drawPixelEllipse(context, {
      x: ground.x + (noise(seed, i) - 0.5) * 30 * scale,
      y: ground.y - share * (4 + noise(seed, i + 7) * 8) - 2,
      radiusX: radius,
      radiusY: radius * 0.8,
    });
  }

  context.globalAlpha = 1;
}

const RISE_TICKS = 8;
const COLUMNS = 9;
const BRICK = 9;

function drawColumn(context, { x, base, height, art, i }) {
  const top = Math.round(base - height);

  context.fillStyle = art.body[i % 2 ? 2 : 3];
  context.fillRect(x, top, 4, Math.round(height));
  context.fillStyle = art.body[1];

  for (let y = top + BRICK - (i % 2) * 3; y < base - 1; y += BRICK) {
    context.fillRect(x, y, 4, 1);
  }

  context.fillStyle = art.body[4];
  context.fillRect(x, top, 4, 2);
}

// a wall of light and dust rising out of the grass in front of the blocker, between him and the
// ball: stone courses of light, taller in its middle, falling away
export function drawWall(context, { camera, place, art, age, share, scale }) {
  const ground = project(camera, place.x, place.y);
  const tallest = 58 * scale * Math.min(1, (age + 1) / RISE_TICKS);

  context.globalAlpha = share < 0.6 ? 0.85 : (1 - share) * 2;

  for (let i = 0; i < COLUMNS; i += 1) {
    const off = (i - (COLUMNS - 1) / 2) / ((COLUMNS - 1) / 2);

    drawColumn(context, {
      x: Math.round(ground.x + off * 16) - 2,
      base: Math.round(ground.y + off * 3),
      height: tallest * (1 - off * off * 0.45),
      art,
      i,
    });
  }

  context.globalAlpha = 1;
  drawDustCloud(context, { ground, art, share, scale, seed: 3, puffs: 3 });
}
