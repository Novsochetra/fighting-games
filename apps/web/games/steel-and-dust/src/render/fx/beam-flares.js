import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { FACE_TIMES } from '../../sim/hazards/stone-faces.js';
import { PIXEL, ellipseRows, fillRows, fineLine, flicker, inLight, snap } from './fine-pixels.js';
import { drawHalo, drawStar } from './light-star.js';

const ARCS = 3;
const ARC_SPAN = 46;
const ARC_STEPS = 9;
const ARC_SWING = 8;
const RAYS = 6;
// sparks spray back off the beam's tip, each living this many ticks
const SPRAY = 4;
const SPRAY_LIFE = 8;

// a fork of lightning round the beam: points wandering either side of its line, jumping to a new
// stretch of it every couple of ticks
export function arcPoints({ face, mouth, length }, arc) {
  const beat = face.time >> 1;
  const start = flicker(beat, arc + 7) * Math.max(0, length - ARC_SPAN);
  return Array.from({ length: ARC_STEPS + 1 }, (_, step) => ({
    x: mouth.x + face.direction * (start + (step * ARC_SPAN) / ARC_STEPS),
    y: mouth.y + (flicker(step + arc * 16, beat) - 0.5) * 2 * ARC_SWING,
  }));
}

function drawPath(context, points, width) {
  for (let i = 1; i < points.length; i++) {
    fineLine(context, { from: points[i - 1], to: points[i], width });
  }
}

export function drawLightning(context, beam) {
  const beat = beam.face.time >> 1;
  for (let arc = 0; arc < ARCS; arc++) {
    if (flicker(arc, beat) < 0.3) {
      continue;
    }
    const points = arcPoints(beam, arc);
    inLight(context, () => {
      context.globalAlpha = 0.4;
      context.fillStyle = FX_COLORS.gazeGold;
      drawPath(context, points, 3);
    });
    context.globalAlpha = 1;
    context.fillStyle = arc % 2 ? FX_COLORS.gazeWhite : COLORS.white;
    drawPath(context, points, 1);
  }
}

// a flare of light bursts in the open mouth, throbbing, its rays turning, brightest as the beam is
// loosed
export function drawMuzzle(context, { face, mouth }) {
  const since = face.time - FACE_TIMES.fire;
  const burst = Math.max(0, 1 - since / 8);
  const radius = snap(5 + ((face.time >> 2) & 1) + burst * 4);
  drawHalo(context, { ...mouth, radius, strength: 1.4 });
  context.fillStyle = FX_COLORS.gazeWhite;
  fillRows(context, { ...mouth, rows: ellipseRows(radius * 0.45, radius * 0.45) });
  for (let ray = 0; ray < RAYS; ray++) {
    const angle = face.time * 0.15 + (ray * Math.PI * 2) / RAYS;
    const reach = radius + 2 + flicker(ray, face.time >> 1) * 4;
    const point = (distance) => ({
      x: mouth.x + Math.cos(angle) * distance,
      y: mouth.y + Math.sin(angle) * distance,
    });
    context.fillStyle = FX_COLORS.gazeGold;
    fineLine(context, { from: point(reach * 0.7), to: point(reach) });
    context.fillStyle = FX_COLORS.gazeWhite;
    fineLine(context, { from: point(radius * 0.5), to: point(reach * 0.7) });
  }
  drawStar(context, { ...mouth, arm: Math.round(6 + burst * 10 + ((face.time >> 1) & 1) * 2) });
}

// sparks thrown back off the tip, each flying a new way every life
function drawSpray(context, { face, x, y }) {
  for (let i = 0; i < SPRAY; i++) {
    const life = face.time + (i * SPRAY_LIFE) / SPRAY;
    const age = life % SPRAY_LIFE;
    const cycle = Math.floor(life / SPRAY_LIFE);
    const speed = 0.8 + flicker(i, cycle) * 0.9;
    const rise = (flicker(i + 5, cycle) - 0.6) * 1.4;
    context.globalAlpha = 1 - age / SPRAY_LIFE;
    context.fillStyle = age < 3 ? FX_COLORS.gazeWhite : FX_COLORS.gazeGold;
    context.fillRect(snap(x - face.direction * age * speed), snap(y + age * rise), PIXEL, PIXEL);
  }
  context.globalAlpha = 1;
}

// where the beam ends, its light splashes in a flickering star and throws sparks back
export function drawTip(context, { face, mouth, length }) {
  const x = mouth.x + face.direction * length;
  const radius = snap(3 + flicker(face.time, 3) * 2);
  drawHalo(context, { x, y: mouth.y, radius: radius * 1.4, strength: 1.3 });
  drawStar(context, { x, y: mouth.y, arm: Math.round(radius / PIXEL) + 2 });
  drawSpray(context, { face, x, y: mouth.y });
}
