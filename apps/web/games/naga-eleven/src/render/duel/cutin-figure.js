import { CUTIN_FRAMES } from '../../art/cutin-art.js';
import { BALL_ART } from '../../art/duel/looks.js';
import { recipeFor } from '../portraits/cast/index.js';
import { cachedCanvas } from '../portraits/cache.js';
import { decodePart } from '../portraits/kit/decode.js';
import { LEGEND } from '../portraits/legend.js';

const parts = new Map();

// the players' frames are in the portraits' letters; the ball's and the net's in the effects' codes,
// whose `d` is their own
function partOf(name, index, stored) {
  const key = `${name}-${index + 1}`;

  if (!parts.has(key)) {
    parts.set(key, decodePart(CUTIN_FRAMES[key], stored));
  }

  return parts.get(key);
}

function paintPart(context, part, { colourOf, unit, left = 0, top = 0 }) {
  part.cells.forEach((letter, i) => {
    if (letter) {
      context.fillStyle = colourOf(letter);
      context.fillRect(
        left + (i % part.width) * unit,
        top + Math.floor(i / part.width) * unit,
        unit,
        unit,
      );
    }
  });
}

function drawPart(pen, { part, at, key, colourOf }) {
  const left = pen.origin.x + (at.x - Math.round(part.anchor.x)) * pen.unit;
  const top = pen.origin.y + (at.y - Math.round(part.anchor.y)) * pen.unit;
  const size = Math.max(part.width, part.height) * pen.unit;
  const canvas = cachedCanvas(key, size, (context) =>
    paintPart(context, part, { colourOf, unit: pen.unit }),
  );

  if (canvas) {
    pen.context.drawImage(canvas, left, top);

    return;
  }

  paintPart(pen.context, part, { colourOf, unit: pen.unit, left, top });
}

const lookKey = (look) =>
  `${look.character}|${look.age ?? ''}|${JSON.stringify(look.variant ?? null)}`;

export function drawCutinFigure(pen, { name, index, feet, look }) {
  const { palette } = recipeFor(look);

  drawPart(pen, {
    part: partOf(name, index),
    at: feet,
    key: `figure|${name}|${index}|${lookKey(look)}`,
    colourOf: (letter) => palette[LEGEND[letter]] ?? palette.outline,
  });
}

export function drawCutinBall(pen, { name, index, at, art }) {
  const [deep, mid, light, white] = BALL_ART.ramp;
  const colours = { o: BALL_ART.ink, d: deep, m: mid, l: light, h: white, r: light, e: white };
  const accent = { y: art.accent[1], g: art.accent[2], G: art.accent[3] };
  const palette = { ...colours, ...accent, E: white };

  drawPart(pen, {
    part: partOf(name, index, {}),
    at,
    key: `ball|${name}|${index}|${art.accent[2]}`,
    colourOf: (code) => palette[code] ?? BALL_ART.ink,
  });
}
