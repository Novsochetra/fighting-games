import { placeOnBillboard } from '../layers/billboard.js';

// the rows of the view a layer covers this frame, trimmed by `inset` pixels at its top and bottom
export function bandOf(layer, view, { top = 0, bottom = 0 } = {}) {
  const corner = placeOnBillboard(layer, view, { column: 0, row: 0 });

  return { top: corner.y + top, bottom: corner.y + layer.frame.height - bottom };
}
