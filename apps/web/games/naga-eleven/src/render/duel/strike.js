import { CUTIN_FRAMES } from '../../art/cutin-art.js';
import { recipeFor } from '../portraits/cast/index.js';
import { cachedCanvas } from '../portraits/cache.js';
import { decodePart } from '../portraits/kit/decode.js';
import { LEGEND } from '../portraits/legend.js';

export const STRIKE_FRAMES = 5;

// a frame of the strike plays this many ticks, so the kick lands before a repeated cut-in ends
const FRAME_TICKS = 6;

// the strike was drawn for Sochetra, his hair and his build; any other striker keeps his portrait
const STRIKERS = new Set(['sochetra']);

const parts = new Map();

function partOf(index) {
  if (!parts.has(index)) {
    parts.set(index, decodePart(CUTIN_FRAMES[`strike-${index + 1}`]));
  }

  return parts.get(index);
}

export const strikesIn = ({ striker, partner }, option) =>
  STRIKERS.has(striker?.star) && !partner && option?.kind === 'shot';

export const strikeFrameAt = (ticks) =>
  Math.min(STRIKE_FRAMES - 1, Math.floor(ticks / FRAME_TICKS));

function paintPart(context, part, { palette, unit, left = 0, top = 0 }) {
  part.cells.forEach((letter, i) => {
    if (letter) {
      context.fillStyle = palette[LEGEND[letter]] ?? palette.outline;
      context.fillRect(
        left + (i % part.width) * unit,
        top + Math.floor(i / part.width) * unit,
        unit,
        unit,
      );
    }
  });
}

const keyOf = (look, index) =>
  `strike|${index}|${look.character}|${look.age ?? ''}|${JSON.stringify(look.variant ?? null)}`;

export function drawStrike(pen, { feet, look, index }) {
  const part = partOf(index);
  const { palette } = recipeFor(look);
  const left = pen.origin.x + (feet.x - Math.round(part.anchor.x)) * pen.unit;
  const top = pen.origin.y + (feet.y - Math.round(part.anchor.y)) * pen.unit;
  const size = Math.max(part.width, part.height) * pen.unit;
  const canvas = cachedCanvas(keyOf(look, index), size, (context) =>
    paintPart(context, part, { palette, unit: pen.unit }),
  );

  if (canvas) {
    pen.context.drawImage(canvas, left, top);

    return;
  }

  paintPart(pen.context, part, { palette, unit: pen.unit, left, top });
}
