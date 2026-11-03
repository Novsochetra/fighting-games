import { NAGA_HEAD } from '../maps.js';
import { across } from '../paint.js';
import { paintMap } from '../pixel-map.js';
import { paletteOf } from '../move-plan.js';
import { blockBetween } from './band.js';

const WAVES = 1.6;
const SWIM = 0.22;

// the serpent's body winds about the ball's path, swelling in the middle and meeting the ball at
// its head; `phase` turns a second one the other way about the first
export function coilOf(trail, { amplitude, phase = 0 }) {
  return trail.samples.map((sample) => {
    const normal = across(sample);
    const swell = 4 * sample.t * (1 - sample.t);
    const wave =
      Math.sin(sample.t * WAVES * Math.PI * 2 - trail.tick * SWIM + phase) * amplitude * swell;

    return { ...sample, x: sample.x + normal.x * wave, y: sample.y + normal.y * wave };
  });
}

// the body's own way at each sample, so its blocks follow its bends and not the ball's path
function alongItself(points) {
  return points.map((point, i) => {
    const before = points[Math.max(0, i - 1)];
    const after = points[Math.min(points.length - 1, i + 1)];
    const reach = Math.hypot(after.x - before.x, after.y - before.y) || 1;

    return { ...point, dx: (after.x - before.x) / reach, dy: (after.y - before.y) / reach };
  });
}

function drawLayer(context, body, { colour, width, shift = 0 }) {
  context.fillStyle = colour;

  for (let i = 0; i < body.length - 1; i += 1) {
    const size = Math.max(1, width(body[i]));

    blockBetween(context, body[i], body[i + 1], {
      width: size,
      shift: shift * Math.max(0, width(body[i]) / 2),
    });
  }
}

// an outline, the body lit along its back and its gold belly, round as a serpent is
export function drawSerpentBody(context, points, { art, width, belly = true }) {
  const body = alongItself(points);
  const alpha = context.globalAlpha;

  context.globalAlpha = alpha;
  drawLayer(context, body, { colour: art.body[0], width: (point) => width(point) + 2 });
  drawLayer(context, body, { colour: art.body[2], width });
  drawLayer(context, body, {
    colour: art.body[3],
    width: (point) => Math.ceil(width(point) / 2),
    shift: 0.5,
  });

  if (belly) {
    drawLayer(context, body.slice(Math.floor(body.length * 0.35)), {
      colour: art.accent[2],
      width: () => 1,
      shift: -0.6,
    });
  }
}

export function drawHead(context, trail, { map = NAGA_HEAD, at = trail.head, art = trail.art }) {
  paintMap(context, map, { ...at, palette: paletteOf(art), flip: trail.flip, bake: trail.bake });
}

// the Naga: one serpent winding round the ball's path, its head at the ball
export function drawCoils(context, trail) {
  context.globalAlpha = trail.alpha;
  drawSerpentBody(context, coilOf(trail, { amplitude: 13 }), {
    art: trail.art,
    width: (sample) => 3 + sample.t * 5,
  });
  drawHead(context, trail, {});
  context.globalAlpha = 1;
}

// Twin Naga: a jade serpent and a blue one about each other, two heads at the ball
export function drawTwinCoils(context, trail) {
  const blue = { ...trail.art, body: [trail.art.body[0], ...trail.art.accent.slice(1, 5)] };
  const width = (sample) => 2 + sample.t * 4;

  context.globalAlpha = trail.alpha;
  drawSerpentBody(context, coilOf(trail, { amplitude: 15, phase: Math.PI }), {
    art: blue,
    width,
    belly: false,
  });
  drawSerpentBody(context, coilOf(trail, { amplitude: 15 }), { art: trail.art, width });
  drawHead(context, trail, { at: { x: trail.head.x - 2, y: trail.head.y + 5 }, art: blue });
  drawHead(context, trail, { at: { x: trail.head.x, y: trail.head.y - 3 } });
  context.globalAlpha = 1;
}

const HOOD = { heads: 7, radius: 21, from: -172, to: -8 };

// the hood's heads on an arc over the ball, each with the root of its neck
export function hoodHeads(trail) {
  const back = trail.flip ? 9 : -9;
  const centre = { x: trail.head.x + back, y: trail.head.y - 2 };

  return Array.from({ length: HOOD.heads }, (_, i) => {
    const degrees = HOOD.from + ((HOOD.to - HOOD.from) * i) / (HOOD.heads - 1);
    const angle = (degrees * Math.PI) / 180;

    return {
      centre,
      x: centre.x + Math.cos(angle) * HOOD.radius,
      y: centre.y + Math.sin(angle) * HOOD.radius * 0.9,
    };
  });
}
