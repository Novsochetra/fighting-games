import { drawDashedEllipse } from '../ellipse.js';
import { noise } from '../noise.js';

const MOTES = 16;
const CYCLE = 34;

// a pillar of light behind him, brighter to its middle and rounded at its top
const PILLAR = [
  { half: 12, lift: 4, alpha: 0.08 },
  { half: 9, lift: 10, alpha: 0.09 },
  { half: 6, lift: 14, alpha: 0.11 },
];

function drawGlowColumn(context, { foot, height, art, strength }) {
  context.fillStyle = art.body[4];

  for (const { half, lift, alpha } of PILLAR) {
    context.globalAlpha = strength * alpha;
    context.fillRect(
      Math.round(foot.x) - half,
      Math.round(foot.y - height - lift),
      half * 2 + 1,
      height + lift + 2,
    );
  }
}

function drawMote(context, { x, y, art, up, isStar }) {
  context.fillStyle = up < 0.5 ? art.body[4] : art.accent[3];

  if (isStar) {
    context.fillRect(x - 1, y, 3, 1);
    context.fillRect(x, y - 1, 1, 3);

    return;
  }

  context.fillRect(x, y, 1, 2);
  context.fillStyle = art.body[3];
  context.fillRect(x, y + 2, 1, 2);
}

// sparks rising round the player from his feet to over his head in a glow of light, a ring of it
// on the grass under them
export function drawMotes(context, { foot, height, art, tick, strength, seed }) {
  drawGlowColumn(context, { foot, height, art, strength });
  context.globalAlpha = strength * 0.9;
  drawDashedEllipse(context, {
    x: foot.x,
    y: foot.y,
    radiusX: 15,
    radiusY: 5,
    count: 22,
    size: 3,
    colour: art.body[4],
    back: art.body[3],
    turn: tick * 0.05,
  });

  for (let i = 0; i < MOTES; i += 1) {
    const up = ((tick + Math.floor(noise(seed, i) * CYCLE)) % CYCLE) / CYCLE;
    const x = foot.x + (noise(seed, i + 10) - 0.5) * 30 + Math.sin(tick / 7 + i) * 2;

    context.globalAlpha = strength * (1 - up * 0.6);
    drawMote(context, {
      x: Math.round(x),
      y: Math.round(foot.y - up * (height + 16)),
      art,
      up,
      isStar: i % 3 === 0,
    });
  }

  context.globalAlpha = 1;
}

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
