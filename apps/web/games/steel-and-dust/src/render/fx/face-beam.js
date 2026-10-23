import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { FACE_TIMES, beamLength, mouthOf } from '../../sim/hazards/stone-faces.js';
import { drawLightning, drawMuzzle, drawTip } from './beam-flares.js';
import { PIXEL, flicker, inLight, snap } from './fine-pixels.js';
import { createRunFill } from './run-fill.js';

// the beam narrows over its last stretch to a point, and over its last ticks to nothing
const TAPER = 20;
const DIE_TICKS = 5;
// bright packets of light run out along the beam this fast
const PULSE_SPEED = 7;
const PULSES = 3;

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
export function beamProfile(face, run, length) {
  const time = face.time;
  const wave = Math.sin(run * 0.32 - time * 0.85) + Math.sin(run * 0.09 + time * 0.37) * 0.7;
  const bump = pulseAt(face, run, length);
  const tip = Math.min(1, (length - run) / TAPER) ** 0.6;
  const dying = Math.min(1, (FACE_TIMES.sink - time) / DIE_TICKS);
  const size = tip * dying;
  return {
    glow: (8 + wave + flicker(run >> 1, time >> 1) * 2) * size,
    body: (4.5 + wave * 0.6 + bump * 1.8) * size * Math.min(1, 0.6 + run / 10),
    core: (1.2 + bump) * size,
  };
}

// the bands of a column out from the beam's line, outermost first, each drawn over the last: a
// deep amber edge, ember, gold, a pale gold ring round the core and the white-hot core
const BANDS = [
  { color: FX_COLORS.gazeDeep, half: (shape) => shape.body + PIXEL * 2 },
  { color: FX_COLORS.gazeEmber, half: (shape) => shape.body + PIXEL },
  { color: FX_COLORS.gazeGold, half: (shape) => shape.body },
  { color: FX_COLORS.gazeWhite, half: (shape) => shape.core + 1 },
  { color: COLORS.white, half: (shape) => Math.max(PIXEL, shape.core * 0.6) },
];
const GLOWS = [
  { color: FX_COLORS.gazeEmber, alpha: 0.28, half: (shape) => shape.glow },
  { color: FX_COLORS.gazeGold, alpha: 0.3, half: (shape) => shape.glow * 0.65 },
];

function columnsOf(face, mouth, length) {
  const columns = [];
  for (let run = -2; run < length; run += PIXEL) {
    const x = face.direction > 0 ? mouth.x + run : mouth.x - run - PIXEL;
    columns.push({ x: snap(x), shape: beamProfile(face, Math.max(0, run), length) });
  }
  return columns;
}

// one band down the whole beam, each column spanning the same whole screen pixels either side
function drawBand(context, { columns, y, color, half }) {
  context.fillStyle = color;
  const fills = createRunFill(context);
  for (const column of columns) {
    const span = snap(half(column.shape));
    fills.add(column.x, y - span, PIXEL, span * 2);
  }
  fills.flush();
}

// light thrown on the road under the beam
function drawFloorLight(context, face, { mouth, length }) {
  const left = snap(face.direction > 0 ? mouth.x : mouth.x - length);
  const width = snap(length);
  inLight(context, () => {
    context.globalAlpha = 0.14;
    context.fillStyle = FX_COLORS.gazeGold;
    context.fillRect(left, snap(face.floor) - 3, width, 4);
    context.globalAlpha = 0.22;
    context.fillStyle = FX_COLORS.gazeEmber;
    context.fillRect(left, snap(face.floor) - 1, width, 1);
  });
  context.globalAlpha = 1;
}

// the face's breath of gold: a glowing body banded down to a white-hot core, waving and pulsing as
// it runs across the arena, crackling with lightning, flaring at the mouth and bursting at its tip
export function drawFaceBeam(painter, face) {
  const context = painter.context;
  const mouth = mouthOf(face);
  const length = beamLength(face);
  const beam = { columns: columnsOf(face, mouth, length), y: snap(mouth.y) };
  drawFloorLight(context, face, { mouth, length });
  inLight(context, () => {
    for (const glow of GLOWS) {
      context.globalAlpha = glow.alpha;
      drawBand(context, { ...beam, ...glow });
    }
  });
  context.globalAlpha = 1;
  for (const band of BANDS) {
    drawBand(context, { ...beam, ...band });
  }
  drawLightning(context, { face, mouth, length });
  drawMuzzle(context, { face, mouth });
  drawTip(context, { face, mouth, length });
}
