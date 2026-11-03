import { shiftedPen } from './pen.js';

// a pen that draws only inside a box of art pixels, as a band or a window holds what is in it:
// the canvas's own clip would cut on canvas pixels, between the art's
export function clippedPen(pen, { x, y, width, height }) {
  function rect([left, top, boxWidth, boxHeight], color) {
    const fromX = Math.max(x, Math.round(left));
    const fromY = Math.max(y, Math.round(top));
    const toX = Math.min(x + width, Math.round(left + boxWidth));
    const toY = Math.min(y + height, Math.round(top + boxHeight));

    pen.rect([fromX, fromY, toX - fromX, toY - fromY], color);
  }

  const shifted = (dx, dy) =>
    clippedPen(shiftedPen({ ...pen, shifted: undefined }, dx, dy), {
      x: x - dx,
      y: y - dy,
      width,
      height,
    });

  return { ...pen, rect, shifted, dot: (left, top, color) => rect([left, top, 1, 1], color) };
}
