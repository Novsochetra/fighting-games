// draws on a grid of art pixels `unit` canvas pixels square, always on whole pixels, as rows of
// rectangles: a canvas smooths the edges of the paths it fills, which pixel art must never have
export function createPen(context, { unit = 3, x = 0, y = 0 } = {}) {
  const origin = { x: Math.round(x), y: Math.round(y) };

  // a box is [left, top, width, height] in art pixels
  function rect([left, top, width, height], color) {
    const fromX = Math.round(left);
    const fromY = Math.round(top);
    const toX = Math.round(left + width);
    const toY = Math.round(top + height);

    if (toX <= fromX || toY <= fromY || !color) {
      return;
    }

    context.fillStyle = color;
    context.fillRect(
      origin.x + fromX * unit,
      origin.y + fromY * unit,
      (toX - fromX) * unit,
      (toY - fromY) * unit,
    );
  }

  return { context, unit, origin, rect, dot: (left, top, color) => rect([left, top, 1, 1], color) };
}

// a pen moved by whole art pixels, as a shake or a slide moves what it draws; a pen that clips
// keeps its clip where it was
export const shiftedPen = (pen, dx, dy) =>
  pen.shifted?.(Math.round(dx), Math.round(dy)) ??
  createPen(pen.context, {
    unit: pen.unit,
    x: pen.origin.x + Math.round(dx) * pen.unit,
    y: pen.origin.y + Math.round(dy) * pen.unit,
  });
