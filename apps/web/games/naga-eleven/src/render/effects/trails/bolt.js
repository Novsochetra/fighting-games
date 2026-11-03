import { noise } from '../noise.js';
import { across, drawLine } from '../paint.js';

// the bolt jumps to a new path every few ticks, as lightning crackles
const CRACKLE = 3;
const EVERY = 4;

function nodesOf(trail) {
  const { samples } = trail;
  const crackle = Math.floor(trail.tick / CRACKLE);
  const nodes = [];

  for (let i = 0; i < samples.length; i += EVERY) {
    const sample = samples[i];
    const normal = across(sample);
    const isEnd = i === 0 || i + EVERY >= samples.length;
    const off = isEnd ? 0 : (noise(crackle, i) - 0.5) * 18;

    nodes.push({ x: sample.x + normal.x * off, y: sample.y + normal.y * off, t: sample.t });
  }

  return [...nodes, trail.head];
}

function drawZigzag(context, nodes, { colour, thickness }) {
  context.fillStyle = colour;

  for (let i = 1; i < nodes.length; i += 1) {
    drawLine(context, nodes[i - 1], nodes[i], thickness);
  }
}

// Thunder Shot, Chrey Lightning: a white bolt zigzagging to the ball in a glow of its colour, a
// fork off it now and then
export function drawBolt(context, trail) {
  const { art, alpha, tick } = trail;
  const nodes = nodesOf(trail);

  context.globalAlpha = alpha * 0.45;
  drawZigzag(context, nodes, { colour: art.body[2], thickness: 7 });
  context.globalAlpha = alpha;
  drawZigzag(context, nodes, { colour: art.body[4], thickness: 2 });

  const fork = nodes[1 + (Math.floor(tick / CRACKLE) % Math.max(1, nodes.length - 2))];

  if (fork && nodes.length > 3) {
    const end = { x: fork.x - (trail.flip ? -10 : 10), y: fork.y + (tick % 2 ? 9 : -9) };

    context.fillStyle = art.body[3];
    drawLine(context, fork, end, 1);
  }

  context.fillStyle = art.accent[2];
  context.fillRect(Math.round(trail.head.x) - 3, Math.round(trail.head.y), 7, 1);
  context.fillRect(Math.round(trail.head.x), Math.round(trail.head.y) - 3, 1, 7);
  context.globalAlpha = 1;
}
