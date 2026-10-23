import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { FACE_TIMES, mouthOf } from '../../sim/hazards/stone-faces.js';
import { PIXEL, ellipseRows, fillRows, snap } from './fine-pixels.js';
import { drawHalo, drawStar } from './light-star.js';

// motes of light are drawn in to the mouth from this far out, each closing in over this share of
// the glare, while the light in the mouth swells
const MOTES = 6;
const MOTE_FROM = 16;
const MOTE_SHARE = 0.5;

export const gatherShare = (face) =>
  Math.min(1, Math.max(0, (face.time - FACE_TIMES.glare) / (FACE_TIMES.fire - FACE_TIMES.glare)));

// how far out from the mouth each mote still is, as a share of where it set out from
export function moteDistances(face) {
  const share = gatherShare(face);
  return Array.from({ length: MOTES }, (_, i) => 1 - ((share / MOTE_SHARE + i / MOTES) % 1));
}

function drawMotes(context, { face, mouth }) {
  moteDistances(face).forEach((distance, i) => {
    const angle = (i * Math.PI * 2) / MOTES + face.time * 0.05;
    const x = snap(mouth.x + Math.cos(angle) * distance * MOTE_FROM);
    const y = snap(mouth.y + Math.sin(angle) * distance * MOTE_FROM * 0.7);
    context.fillStyle = FX_COLORS.gazeGold;
    context.fillRect(x - PIXEL, y, PIXEL * 3, PIXEL);
    context.fillRect(x, y - PIXEL, PIXEL, PIXEL * 3);
    context.fillStyle = COLORS.white;
    context.fillRect(x, y, PIXEL, PIXEL);
  });
}

// while the face glares, light gathers in its mouth before the beam: motes drawn in, a glow
// swelling and, at the last, a star
export function drawMouthGather(context, face) {
  const mouth = mouthOf(face);
  const share = gatherShare(face);
  const radius = snap(1 + share * 4);
  drawHalo(context, { ...mouth, radius, strength: 0.6 + share });
  context.fillStyle = FX_COLORS.gazeWhite;
  fillRows(context, { ...mouth, rows: ellipseRows(radius * 0.4, radius * 0.4) });
  drawMotes(context, { face, mouth });
  if (share > 0.7) {
    drawStar(context, { ...mouth, arm: Math.round(share * 8) });
  }
}
