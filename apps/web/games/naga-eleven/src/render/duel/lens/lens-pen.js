import { ART, INNER } from '../layout.js';
import { createPen } from '../pen.js';

export const MIDDLE = { x: ART.width / 2, y: ART.height / 2 };

export const MOST_STEPS = 3;

// a zoom step draws an art pixel one more canvas pixel wide, never a share of one: a pixel art
// scaled by a share comes out in uneven columns
export const zoomOf = (pen, step) => (pen.unit + step) / pen.unit;

// the view stays on the art grid across and between the bars up and down, the part every scene
// paints, so the match under a show never shows at its edge
export function clampedCentre({ x, y }, zoom) {
  const halfWidth = MIDDLE.x / zoom;
  const halfHeight = (MIDDLE.y - INNER.top) / zoom;

  return {
    x: Math.min(ART.width - halfWidth, Math.max(halfWidth, x)),
    y: Math.min(INNER.bottom - halfHeight, Math.max(INNER.top + halfHeight, y)),
  };
}

// a pen that draws what `pen` would, seen by a camera looking at `view` ({ x, y } on the art grid)
// `view.step` zoom steps in; step 0 is the pen itself
export function lensPen(pen, view) {
  const step = Math.max(0, Math.min(MOST_STEPS, Math.round(view?.step ?? 0)));

  if (step === 0) {
    return pen;
  }

  const unit = pen.unit + step;
  const centre = clampedCentre(view, unit / pen.unit);

  return createPen(pen.context, {
    unit,
    x: pen.origin.x + MIDDLE.x * pen.unit - centre.x * unit,
    y: pen.origin.y + MIDDLE.y * pen.unit - centre.y * unit,
  });
}
