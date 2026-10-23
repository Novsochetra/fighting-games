import { FX_COLORS } from '../../art/fx-colors.js';
import { FACE_TIMES } from '../../sim/hazards/stone-faces.js';

// a steady hash for flicker: drawing never draws on Math.random, which the simulation uses
export function noise(first, second) {
  const value = Math.sin(first * 12.9898 + second * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const ARCS = 3;
const ARC_SPAN = 46;
const ARC_STEPS = 7;
const RAYS = 6;

function disc(context, { x, y, radius, color, alpha }) {
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

// thin forks of lightning crackle round the beam, jumping to new places every few ticks
export function drawLightning(context, { face, mouth, length }) {
  const beat = face.time >> 1;
  context.globalCompositeOperation = 'lighter';
  context.lineWidth = 0.5;
  for (let arc = 0; arc < ARCS; arc++) {
    if (noise(arc, beat) < 0.3) {
      continue;
    }
    const start = noise(beat, arc + 7) * Math.max(0, length - ARC_SPAN);
    context.strokeStyle = arc % 2 ? FX_COLORS.gazeWhite : FX_COLORS.gazeGold;
    context.globalAlpha = 0.9;
    context.beginPath();
    for (let step = 0; step <= ARC_STEPS; step++) {
      const run = start + (step * ARC_SPAN) / ARC_STEPS;
      const side = step % 2 ? 1 : -1;
      const y = mouth.y + side * (4 + noise(step + arc * 9, beat) * 7);
      const x = mouth.x + face.direction * run;
      context[step ? 'lineTo' : 'moveTo'](x, y);
    }
    context.stroke();
  }
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;
}

// a flare of light bursts in the open mouth, its rays turning, brightest as the beam is loosed
export function drawMuzzle(context, { face, mouth }) {
  const since = face.time - FACE_TIMES.fire;
  const burst = Math.max(0, 1 - since / 8);
  const radius = 8 + Math.sin(face.time * 0.8) * 1.5 + burst * 10;
  context.globalCompositeOperation = 'lighter';
  disc(context, { ...mouth, radius, color: FX_COLORS.gazeEmber, alpha: 0.35 });
  disc(context, { ...mouth, radius: radius * 0.6, color: FX_COLORS.gazeGold, alpha: 0.6 });
  disc(context, { ...mouth, radius: radius * 0.3, color: FX_COLORS.gazeWhite, alpha: 0.9 });
  context.strokeStyle = FX_COLORS.gazeWhite;
  context.lineWidth = 0.5;
  context.globalAlpha = 0.8;
  for (let ray = 0; ray < RAYS; ray++) {
    const angle = face.time * 0.15 + (ray * Math.PI * 2) / RAYS;
    const reach = radius + 3 + noise(ray, face.time >> 1) * 5;
    const near = radius * 0.5;
    context.beginPath();
    context.moveTo(mouth.x + Math.cos(angle) * near, mouth.y + Math.sin(angle) * near);
    context.lineTo(mouth.x + Math.cos(angle) * reach, mouth.y + Math.sin(angle) * reach);
    context.stroke();
  }
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;
}

// where the beam ends, its light splashes in a flickering star
export function drawTip(context, { face, mouth, length }) {
  const x = mouth.x + face.direction * length;
  const flicker = noise(face.time, 3);
  const radius = 4 + flicker * 3;
  context.globalCompositeOperation = 'lighter';
  disc(context, { x, y: mouth.y, radius: radius * 1.6, color: FX_COLORS.gazeEmber, alpha: 0.3 });
  disc(context, { x, y: mouth.y, radius, color: FX_COLORS.gazeGold, alpha: 0.55 });
  context.fillStyle = FX_COLORS.gazeWhite;
  context.globalAlpha = 0.9;
  context.fillRect(x - radius - 2, mouth.y - 0.25, radius * 2 + 4, 0.5);
  context.fillRect(x - 0.25, mouth.y - radius, 0.5, radius * 2);
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;
}
