import { ART_SCALE } from './raster.js';

// what moves each tick is drawn straight onto the view, in art pixels, over the cached layer
export function artRect(context, { x, y, width = 1, height = 1 }, color) {
  context.fillStyle = color;
  context.fillRect(
    Math.round(x) * ART_SCALE,
    Math.round(y) * ART_SCALE,
    Math.round(width) * ART_SCALE,
    Math.round(height) * ART_SCALE,
  );
}

export const artDot = (context, { x, y }, color) => artRect(context, { x, y }, color);
