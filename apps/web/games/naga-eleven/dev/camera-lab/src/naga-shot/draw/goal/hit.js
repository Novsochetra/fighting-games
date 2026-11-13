import { SHOT_ART } from '../../colors.js';
import { GROUND } from '../../world.js';
import { meshPolygon } from './net.js';
import { PROFILE, backAt } from './shape.js';

const SHUDDER = 26;

export function swayOf({ ending, ticks }) {
  if (ending !== 'post' || ticks >= SHUDDER) {
    return 0;
  }

  return Math.round(2 * (1 - ticks / SHUDDER) + 0.4) * ((ticks >> 1) & 1 ? 1 : -1);
}

function bulgeOf({ ending, ticks }) {
  if (ending !== 'goal' || ticks < 4 || ticks > 60) {
    return 0;
  }

  if (ticks < 12) {
    return ((ticks - 4) / 8) * BULGE;
  }

  return Math.max(0, BULGE * Math.exp(-(ticks - 12) / 12) * Math.cos((ticks - 12) * 0.38));
}

const SACK_STEPS = 8;

const SACK_HALF = 13;

const BULGE = 10;

function sackOf({ amount, middle }) {
  const heights = Array.from(
    { length: SACK_STEPS + 1 },
    (_, i) => middle + SACK_HALF - (SACK_HALF * 2 * i) / SACK_STEPS,
  );
  const out = heights.map((height, i) => ({
    x: backAt(height) + amount * Math.sin((Math.PI * i) / SACK_STEPS),
    y: GROUND - height,
  }));
  const back = heights.map((height) => ({ x: backAt(height), y: GROUND - height })).reverse();

  return { out, points: [...out, ...back].map(({ x, y }) => [x, y]) };
}

function traceEdge(pen, out) {
  out.slice(1).forEach((next, i) => {
    const from = { x: Math.round(out[i].x), y: Math.round(out[i].y) };
    const to = { x: Math.round(next.x), y: Math.round(next.y) };

    pen.rect([from.x, from.y, 1, Math.max(1, to.y - from.y)], SHOT_ART.mesh);
    pen.rect([Math.min(from.x, to.x), to.y, Math.abs(to.x - from.x) + 1, 1], SHOT_ART.mesh);
  });
}

export function drawBulge(pen, { view, hit, ball }) {
  const amount = bulgeOf(hit);
  const middle = Math.min(PROFILE.bar.h - SACK_HALF, Math.max(SACK_HALF, GROUND - ball.y));

  if (amount < 1) {
    return;
  }

  const sack = sackOf({ amount, middle });
  const origin = view.at(PROFILE.post, 'near');

  meshPolygon(pen, sack.points, {
    colour: SHOT_ART.mesh,
    origin: { x: Math.round(origin.x), y: Math.round(origin.y) },
  });
  traceEdge(pen, sack.out);
}

// as a comic draws a shudder: strokes, no sparks
export function drawShudderLines(pen, { view, hit, sway }) {
  if (hit.ending !== 'post' || hit.ticks >= SHUDDER - 6) {
    return;
  }

  const bar = view.at(PROFILE.bar, 'near');
  const x = Math.round(bar.x + sway);
  const y = Math.round(bar.y);
  const spread = (hit.ticks >> 1) & 1 ? 1 : 0;
  const colour = hit.ticks < 8 ? SHOT_ART.white : SHOT_ART.mesh;

  for (const side of [-1, 1]) {
    const reach = x + side * (6 + spread);

    pen.rect([reach, y - 2, 1, 4], colour);
    pen.rect([reach + side * 3, y - 4, 1, 3], colour);
    pen.rect([reach + side * 3, y + 2, 1, 3], colour);
  }

  pen.rect([x - 1, y - 6 - spread, 3, 1], colour);
}
