import { EMBER_HEAVY_ART } from '../../../art/heavy-fx/ember.js';
import { faceOf, handOf } from '../../../sim/fx/heavy/ember-anchors.js';
import { heavyLeanX } from '../../fighters/heavy-glow.js';
import { ellipseRows, fillRows, flicker } from '../fine-pixels.js';
import { drawFlame } from './ember-flame.js';
import { drawWing } from './ember-wing.js';

const { flame: FLAME, core: CORE } = EMBER_HEAVY_ART;
// the ground catches round the Shade's feet as it gathers: small fires, back to front
const GROUND_FIRES = [-8, -3, 2, 7];
// the fires only take once the wind-up is under way
const GROUND_FROM = 0.25;
// the fireball keeps this far (world pixels) from the Shade's face, so it never hides it
const FACE_CLEAR = 7;
// the fireball in its hands, outside in: each band's share of the radius and its color
const BALL_BANDS = [
  [1, FLAME[4]],
  [0.78, FLAME[3]],
  [0.55, FLAME[1]],
  [0.3, FLAME[0]],
];

function progressOf(move, time) {
  return Math.min(1, (time + 1) / move.startup);
}

function swayAt(seed, time) {
  return Math.round((flicker(seed, time >> 1) - 0.5) * 4);
}

// fires rise round the feet through the wind-up, taller and hotter as the power gathers
function drawGroundFire(painter, { fighter, move, time, leanX }) {
  const progress = progressOf(move, time);
  if (fighter.airborne || time >= move.startup || progress < GROUND_FROM) {
    return;
  }
  GROUND_FIRES.forEach((offset, i) => {
    drawFlame(painter.context, {
      x: fighter.x + offset * fighter.facing + leanX,
      y: fighter.y,
      height: (2 + 5 * progress) * (0.6 + 0.4 * flicker(i * 7, time >> 1)),
      sway: swayAt(i * 13, time),
      cool: 1.3 - progress,
    });
  });
}

// hands held up by the face carry their fireball out ahead of it, or above the head
function clearOfFace(fighter, hand) {
  const face = faceOf(fighter);
  const ahead = (hand.x - face.x) * fighter.facing;
  if (Math.abs(ahead) >= FACE_CLEAR || Math.abs(hand.y - face.y) >= FACE_CLEAR) {
    return hand;
  }
  if (ahead > 0) {
    return { x: face.x + fighter.facing * FACE_CLEAR, y: hand.y };
  }
  return { x: hand.x, y: face.y - FACE_CLEAR };
}

function drawFireball(context, { x, y, radius }) {
  for (const [share, color] of BALL_BANDS) {
    context.fillStyle = color;
    const size = radius * share;
    fillRows(context, { x, y, rows: ellipseRows(size, size) });
  }
}

// a fireball swells in the Shade's hands through the wind-up, flames licking up off it, white-hot
// at its heart by the end
function drawHandFire(painter, { fighter, move, time, leanX }) {
  if (time >= move.startup) {
    return;
  }
  const progress = progressOf(move, time);
  const hand = clearOfFace(fighter, handOf(fighter));
  const at = { x: hand.x + leanX, y: hand.y };
  const { context } = painter;
  const sway = swayAt(3, time);
  const radius = 1 + 1.8 * progress + flicker(5, time) * 0.5;
  const cool = 1 - progress;
  const back = { x: at.x - fighter.facing * 1.5, y: at.y };
  drawFlame(context, { ...back, height: 3 + 3 * progress, sway: -sway, cool: cool + 0.5 });
  drawFlame(context, { ...at, height: 4 + 5 * progress, sway, cool });
  drawFireball(context, { ...at, radius });
  if (progress > 0.6) {
    context.fillStyle = CORE;
    fillRows(context, { ...at, rows: ellipseRows(0.5, 0.5) });
  }
}

function withLean(parts) {
  return { ...parts, leanX: heavyLeanX(parts.fighter, 'ember') };
}

export function drawEmberUnder(painter, parts) {
  const layer = withLean(parts);
  drawWing(painter, layer);
  drawGroundFire(painter, layer);
}

export function drawEmberOver(painter, parts) {
  drawHandFire(painter, withLean(parts));
}
