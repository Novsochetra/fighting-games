import { ANTLER_HEAVY_ART as ART } from '../../../art/heavy-fx/antler.js';
import { PIXEL, fineLine, snap } from '../fine-pixels.js';
import { drawFlame, drawHoof } from './antler-flame.js';

// spirit antlers bursting from a blow, pointing forward: an upper and a lower branch, each with tines
const FORK = [
  [0, 0, 5, -3, 2],
  [5, -3, 10, -6, 2],
  [4, -2.5, 6, -8, 1],
  [8, -5, 9, -10, 1],
  [10, -6, 13, -7, 1],
  [0, 0, 5, 3, 2],
  [5, 3, 10, 5, 1],
  [4, 2.5, 7, 7, 1],
];
const FORK_GROW = 3;

function dot(context, { x, y, width = 1, height = 1, color }) {
  context.fillStyle = color;
  context.fillRect(snap(x), snap(y), width * PIXEL, height * PIXEL);
}

function antlerWisp(painter, particle) {
  drawFlame(painter.context, particle);
}

function antlerHoof(painter, particle) {
  drawHoof(painter.context, particle);
}

function forkPoint(particle, dx, dy, scale) {
  const cos = Math.cos(particle.tilt);
  const sin = Math.sin(particle.tilt);
  return {
    x: particle.x + particle.facing * (dx * cos - dy * sin) * scale,
    y: particle.y + (dx * sin + dy * cos) * scale,
  };
}

function forkColor(age, life) {
  if (age < 2) {
    return ART.antlerTip;
  }
  return life > 3 ? ART.antler : ART.trail;
}

// antlers of light thrust out of the raider as the blow lands, then gone
function antlerFork(painter, particle) {
  const { context } = painter;
  const age = particle.maxLife - particle.life;
  const scale = Math.min(1, (age + 1) / FORK_GROW);
  context.globalAlpha = Math.min(1, particle.life / 3);
  for (const [color, extra] of [
    [ART.edge, 2],
    [forkColor(age, particle.life), 0],
  ]) {
    context.fillStyle = color;
    for (const [fromX, fromY, toX, toY, width] of FORK) {
      const from = forkPoint(particle, fromX, fromY, scale);
      fineLine(context, { from, to: forkPoint(particle, toX, toY, scale), width: width + extra });
    }
  }
  context.globalAlpha = 1;
}

// a streak of the charge: a bright head and a tail of the trail color behind it
function antlerRush(painter, particle) {
  const { context } = painter;
  const { x, y, vx, vy } = particle;
  context.globalAlpha = Math.min(1, (particle.life / particle.maxLife) * 2);
  const tail = { x: x - vx * 3 - Math.sign(vx) * 3, y: y - vy * 3 - Math.sign(vy) * 3 };
  context.fillStyle = ART.trail;
  fineLine(context, { from: tail, to: { x, y }, width: 1 });
  dot(context, { x: x - PIXEL / 2, y: y - PIXEL / 2, width: 2, height: 2, color: ART.antlerTip });
  context.globalAlpha = 1;
}

export const ANTLER_PARTICLE_DRAWS = { antlerWisp, antlerHoof, antlerFork, antlerRush };
