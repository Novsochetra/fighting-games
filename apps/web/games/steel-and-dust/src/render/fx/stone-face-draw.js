import { COLORS } from '../../art/colors.js';
import { FACE_TIMES, isBreathing, mouthOf } from '../../sim/hazards/stone-faces.js';
import { drawFaceBeam } from './face-beam.js';
import { drawFxFrame } from './fx-sheets.js';
import { drawMouthGather } from './mouth-gather.js';

const RISE_TICKS = 8;
// a face climbs this far up out of the road as it rises, and settles back as it crumbles
const RISE_DEPTH = 12;
const SINK_SPEED = 0.6;
const FADE_TICKS = 16;

// frames 0-3 rise out of the rubble, 4 glares, 5 breathes gold, 6 cracks and 7 crumbles
function faceFrame(face) {
  if (face.time < FACE_TIMES.glare) {
    return Math.min(3, Math.floor(face.time / RISE_TICKS));
  }
  if (face.time < FACE_TIMES.fire) {
    return 4;
  }
  if (isBreathing(face)) {
    return 5;
  }
  return face.time < FACE_TIMES.crumble ? 6 : 7;
}

function faceDepth(face) {
  if (face.time < FACE_TIMES.glare) {
    return RISE_DEPTH * (1 - face.time / FACE_TIMES.glare);
  }
  return Math.max(0, face.time - FACE_TIMES.crumble) * SINK_SPEED;
}

const faceAlpha = (face) => Math.min(1, Math.max(0, (FACE_TIMES.gone - face.time) / FADE_TICKS));

// while it glares, the floor under the beam's reach blinks red
function drawWarning(painter, face) {
  const mouth = mouthOf(face);
  const left = face.direction > 0 ? mouth.x : mouth.x - face.reach;
  painter.alpha((face.time >> 2) & 1 ? 0.7 : 0.35).use(COLORS.red);
  painter.rect(left, face.floor - 1, Math.round(face.reach), 4);
  painter.alpha(1);
}

// a giant stone face at the screen's edge, cut off at the road it rises out of
export function drawStoneFace(painter, face, sheets) {
  const context = painter.context;
  context.save();
  context.beginPath();
  context.rect(face.x - 120, face.floor - 240, 240, 240);
  context.clip();
  const y = face.y + faceDepth(face);
  painter.alpha(faceAlpha(face));
  drawFxFrame(painter, sheets, {
    name: 'stoneFace',
    frame: faceFrame(face),
    x: face.x,
    y,
    facing: face.direction,
  });
  painter.alpha(1);
  context.restore();
  if (face.time < FACE_TIMES.fire) {
    drawWarning(painter, face);
  }
}

// the light it gathers and breathes, drawn over the fighters and over the world dimmed for the
// guardian's ultimate, so the dim never dulls it
export function drawStoneFaceLight(painter, face) {
  if (face.time >= FACE_TIMES.glare && face.time < FACE_TIMES.fire) {
    drawMouthGather(painter.context, face);
  } else if (isBreathing(face)) {
    drawFaceBeam(painter, face);
  }
}
