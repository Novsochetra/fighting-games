import { EMBER_HEAVY_ART } from '../../../art/heavy-fx/ember.js';
import { PIXEL, ellipseRows, fillRows, fineLine, fineRect, flicker } from '../fine-pixels.js';
import { drawFlame } from './ember-flame.js';

const { cinder: CINDER, flame: FLAME, core: CORE } = EMBER_HEAVY_ART;

function rampAt(ramp, heat) {
  const index = Math.round((1 - heat) * (ramp.length - 1));
  return ramp[Math.max(0, Math.min(ramp.length - 1, index))];
}

// a square of `size` screen pixels centred on the point
function dot(context, { x, y, color, size = 2 }) {
  context.fillStyle = color;
  const half = (size * PIXEL) / 2;
  fineRect(context, { x: x - half, y: y - half, width: size * PIXEL, height: size * PIXEL });
}

function streak(context, { from, to, color, width = 2 }) {
  context.fillStyle = color;
  fineLine(context, { from, to, width });
}

// a cinder cools from gold to red as it flies, and winks out and back before it dies
function emberCinder(painter, particle) {
  const share = particle.life / particle.maxLife;
  if (share < 0.35 && flicker(particle.seed, particle.life) < 0.4) {
    return;
  }
  const { x, y } = particle;
  const tail = { x: x - particle.vx * 2.5, y: y - particle.vy * 2.5 };
  streak(painter.context, { from: tail, to: particle, color: rampAt(CINDER, share * 0.6) });
  dot(painter.context, { x, y, color: rampAt(CINDER, share), size: share > 0.6 ? 3 : 2 });
}

// a swirling ember heats from orange far out to white as it reaches the hands: a thin comet
function emberSwirl(painter, particle) {
  const heat = 1 - particle.life / particle.maxLife;
  const { context } = painter;
  const from = { x: particle.px, y: particle.py };
  streak(context, { from, to: particle, color: rampAt(CINDER, 0.4 + heat * 0.5), width: 1 });
  dot(context, { x: particle.x, y: particle.y, color: rampAt(CINDER, 0.6 + heat * 0.4) });
}

// a tongue of flame that shrinks and reddens as it burns down; its tip flickers side to side
function emberFlame(painter, particle) {
  const share = particle.life / particle.maxLife;
  const sway = Math.round((flicker(particle.seed, particle.life >> 1) - 0.5) * 4);
  drawFlame(painter.context, {
    x: particle.x,
    y: particle.y,
    height: Math.max(1, particle.size * (0.35 + 0.65 * share)),
    sway,
    cool: (1 - share) * 2,
  });
}

// a burst of fire is a ring of uneven spikes, as the strips' own bursts are drawn, longer upward
const RAYS = 10;

function rayLength(particle, { angle, reach, i }) {
  const rise = 1 + 0.5 * Math.max(0, -Math.sin(angle));
  return reach * (0.5 + 0.5 * flicker(particle.seed + i, 0)) * rise;
}

function drawRay(context, { x, y, angle, length }) {
  const along = (share) => ({
    x: x + Math.cos(angle) * length * share,
    y: y + Math.sin(angle) * length * share,
  });
  streak(context, { from: along(0.45), to: along(1), color: FLAME[3], width: 1 });
  streak(context, { from: along(0), to: along(0.6), color: FLAME[1] });
}

// a starburst of fire flaring out of a white-hot heart and shrinking away
function emberFlare(painter, particle) {
  const share = particle.life / particle.maxLife;
  const reach = Math.max(1, particle.size * share);
  const { context } = painter;
  const { x, y } = particle;
  for (let i = 0; i < RAYS; i++) {
    const angle = ((i + 0.5) / RAYS) * Math.PI * 2;
    drawRay(context, { x, y, angle, length: rayLength(particle, { angle, reach, i }) });
  }
  context.fillStyle = FLAME[2];
  fillRows(context, { x, y, rows: ellipseRows(reach * 0.3, reach * 0.3) });
  dot(context, { x, y, color: FLAME[0], size: 3 });
  dot(context, { x, y, color: CORE, size: 1 });
}

export const EMBER_PARTICLE_DRAWS = { emberCinder, emberSwirl, emberFlame, emberFlare };
