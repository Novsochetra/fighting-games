import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { FACE_TIMES, beamLength, mouthOf } from '../../sim/hazards/stone-faces.js';
import { drawLightning, drawMuzzle, drawTip, noise } from './beam-flares.js';

// one screen pixel, so the beam is drawn at the hero sprites' density
const PIXEL = 0.5;
// the beam narrows over its last stretch to a point, and over its last ticks to nothing
const TAPER = 20;
const DIE_TICKS = 5;
// bright packets of light run out along the beam this fast
const PULSE_SPEED = 7;
const PULSES = 3;

const snap = (value) => Math.round(value / PIXEL) * PIXEL;

function fill(context, color, { x, y, width, height }) {
  context.fillStyle = color;
  context.fillRect(snap(x), snap(y), width, snap(height));
}

function pulseAt(face, run, length) {
  const travelled = (face.time - FACE_TIMES.fire) * PULSE_SPEED;
  let bump = 0;
  for (let i = 0; i < PULSES; i++) {
    const at = (travelled + (i * length) / PULSES) % length;
    bump = Math.max(bump, 1 - Math.abs(run - at) / 7);
  }
  return bump;
}

// how far the glow, the gold body and the white-hot core reach either side of the beam's line
// at this distance from the mouth: a slow wave runs along it, pulses swell it, and it narrows
// to a point at the tip
function profile(face, run, length) {
  const time = face.time;
  const wave = Math.sin(run * 0.32 - time * 0.85) + Math.sin(run * 0.09 + time * 0.37) * 0.7;
  const bump = pulseAt(face, run, length);
  const tip = Math.min(1, (length - run) / TAPER) ** 0.6;
  const dying = Math.min(1, (FACE_TIMES.sink - time) / DIE_TICKS);
  const size = tip * dying;
  return {
    glow: (8 + wave + noise(run >> 1, time >> 1) * 2) * size,
    body: (4.5 + wave * 0.6 + bump * 1.8) * size * Math.min(1, 0.6 + run / 10),
    core: (1.2 + bump) * size,
  };
}

function drawColumn(context, { x, y, shape }) {
  context.globalCompositeOperation = 'lighter';
  context.globalAlpha = 0.28;
  fill(context, FX_COLORS.gazeEmber, {
    x,
    y: y - shape.glow,
    width: PIXEL,
    height: shape.glow * 2,
  });
  context.globalAlpha = 0.3;
  const halo = shape.glow * 0.65;
  fill(context, FX_COLORS.gazeGold, { x, y: y - halo, width: PIXEL, height: halo * 2 });
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;
  const rim = shape.body + PIXEL;
  fill(context, FX_COLORS.gazeEmber, { x, y: y - rim, width: PIXEL, height: rim * 2 });
  fill(context, FX_COLORS.gazeGold, { x, y: y - shape.body, width: PIXEL, height: shape.body * 2 });
  const inner = shape.core + 1;
  fill(context, FX_COLORS.gazeWhite, { x, y: y - inner, width: PIXEL, height: inner * 2 });
  const core = Math.max(PIXEL, shape.core);
  fill(context, COLORS.white, { x, y: y - shape.core / 2, width: PIXEL, height: core });
}

// light thrown on the road under the beam
function drawFloorLight(context, face, length) {
  const mouth = mouthOf(face);
  const left = face.direction > 0 ? mouth.x : mouth.x - length;
  context.globalCompositeOperation = 'lighter';
  context.globalAlpha = 0.14;
  fill(context, FX_COLORS.gazeGold, { x: left, y: face.floor - 3, width: length, height: 4 });
  context.globalAlpha = 0.22;
  fill(context, FX_COLORS.gazeEmber, { x: left, y: face.floor - 1, width: length, height: 1 });
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;
}

// the face's breath of gold: a glowing body with a white-hot core, waving and pulsing as it runs
// across the arena, crackling with lightning, flaring at the mouth and bursting at its tip
export function drawFaceBeam(painter, face) {
  const context = painter.context;
  const mouth = mouthOf(face);
  const length = beamLength(face);
  context.save();
  drawFloorLight(context, face, length);
  for (let run = -2; run < length; run += PIXEL) {
    const x = face.direction > 0 ? mouth.x + run : mouth.x - run - PIXEL;
    drawColumn(context, { x, y: mouth.y, shape: profile(face, Math.max(0, run), length) });
  }
  drawLightning(context, { face, mouth, length });
  drawMuzzle(context, { face, mouth });
  drawTip(context, { face, mouth, length });
  context.restore();
}
