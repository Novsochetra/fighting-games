import { flicker } from '../fine-pixels.js';

// a ring of the grove's light opens on the ground round the Shade's feet as it winds up, turning
// slowly, and bursts out along the ground as it strikes; the far side is drawn behind its feet
const DASHES = 18;
const TILT = 0.24;
const SPIN = 0.12;
const OPEN = { from: 7, to: 19 };
const BURST_TICKS = 6;
const BURST_GROWTH = 5;
const HOT_LEAD = 2;

function radiusOf({ move, time }) {
  if (time < move.startup) {
    const share = (time + 1) / move.startup;
    return OPEN.from + (OPEN.to - OPEN.from) * (1 - (1 - share) ** 2);
  }
  return OPEN.to + (time - move.startup + 1) * BURST_GROWTH;
}

function dashColor(i, front, { move, time, art, tickCount }) {
  const hot = time >= move.startup - HOT_LEAD;
  if (hot) {
    return flicker(i, tickCount >> 1) > 0.5 ? art.bloom : art.glow;
  }
  return front ? art.glow : art.thornLight;
}

function drawDash(painter, { center, radius, angle, length }) {
  const step = 0.09;
  for (let turn = 0; turn < length; turn += step) {
    const x = center.x + Math.cos(angle + turn) * radius;
    const y = center.y + Math.sin(angle + turn) * radius * TILT;
    painter.rect(x, y, 1, 1);
  }
}

export function drawGroundRing(painter, layer, front) {
  const { fighter, move, time } = layer;
  const since = time - move.startup;
  if (fighter.airborne || since >= BURST_TICKS) {
    return;
  }
  const radius = radiusOf(layer);
  const center = { x: fighter.x, y: fighter.y - 1 };
  const length = (Math.PI * 2) / DASHES / (since >= 0 ? 2 : 1.4);
  painter.alpha(since >= 0 ? 1 - since / BURST_TICKS : 1);
  for (let i = 0; i < DASHES; i += 2) {
    const angle = (i / DASHES) * Math.PI * 2 + time * SPIN * fighter.facing;
    if (Math.sin(angle) > 0 === front) {
      painter.use(dashColor(i, front, layer));
      drawDash(painter, { center, radius, angle, length });
    }
  }
  painter.alpha(1);
}
