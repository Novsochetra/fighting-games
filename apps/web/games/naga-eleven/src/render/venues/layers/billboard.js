import { WORLD_VIEW } from '../../../config.js';
import { createRaster } from '../kit/raster.js';

export function bakeBillboard(frame, paint) {
  const raster = createRaster(frame.width, frame.height);

  paint(raster);

  return raster;
}

// only the part of the picture in the view is copied
export function drawBillboard(context, { canvas, frame }, view) {
  const left = Math.round(view.left - frame.middle + (frame.x - view.x) * frame.scale);
  const top = Math.round(frame.baseRow - frame.height + view.top);
  const fromX = Math.max(0, -left);
  const fromY = Math.max(0, -top);
  const width = Math.min(frame.width - fromX, WORLD_VIEW.width - left - fromX);
  const height = Math.min(frame.height - fromY, WORLD_VIEW.height - top - fromY);

  if (!canvas || width <= 0 || height <= 0) {
    return;
  }

  context.drawImage(canvas, fromX, fromY, width, height, left + fromX, top + fromY, width, height);
}

// where a billboard's own pixel lands in the view
export const placeOnBillboard = ({ frame }, view, { column, row }) => ({
  x: Math.round(view.left - frame.middle + (frame.x - view.x) * frame.scale) + column,
  y: Math.round(frame.baseRow - frame.height + view.top) + row,
});
