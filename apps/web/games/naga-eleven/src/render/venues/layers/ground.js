import { WORLD_VIEW } from '../../../config.js';
import { groundAtRow } from '../../camera/lens.js';
import { createRaster } from '../kit/raster.js';

// a row of the ground: its depth, the depths its top and bottom edges stand at, and its scale
function rowOf(lens, frame, index) {
  const lensRow = frame.rowTop + index;

  return {
    index,
    y: groundAtRow(lens, lensRow + 0.5),
    top: groundAtRow(lens, lensRow),
    bottom: groundAtRow(lens, lensRow + 1),
    scale: (lensRow + 0.5) / lens.height,
  };
}

export function bakeGround(lens, frame, paintRow) {
  const raster = createRaster(frame.width, frame.height);

  for (let i = 0; i < frame.height; i += 1) {
    paintRow(raster, rowOf(lens, frame, i));
  }

  return raster;
}

function visibleRows(frame, top) {
  return {
    first: Math.min(frame.height, Math.max(0, -top)),
    last: Math.min(frame.height, Math.max(0, WORLD_VIEW.height - top)),
  };
}

// a row further off is drawn at a smaller scale, so it slides less as the camera moves along: each
// row is offset by its own share, which leans the whole ground as one picture
function leanOf(frame, view) {
  const lean = (frame.x - view.x) / view.lens.height;

  return { lean, start: view.left - frame.middle + lean * frame.rowTop };
}

// the pixel canvas of the tests cannot lean a picture, so it lays the rows down a band at a time
function drawInBands(context, { canvas, frame }, { rows, top, lean, start }) {
  let from = rows.first;

  while (from < rows.last) {
    const shift = Math.round(start + lean * (from + 0.5));
    let to = from + 1;

    while (to < rows.last && Math.round(start + lean * (to + 0.5)) === shift) {
      to += 1;
    }

    context.drawImage(
      canvas,
      0,
      from,
      frame.width,
      to - from,
      shift,
      top + from,
      frame.width,
      to - from,
    );
    from = to;
  }
}

export function drawGround(context, layer, view) {
  const { canvas, frame } = layer;
  const top = Math.round(frame.rowTop + view.top);
  const rows = visibleRows(frame, top);
  const { lean, start } = leanOf(frame, view);

  if (rows.first >= rows.last || !canvas) {
    return;
  }

  if (typeof context.transform !== 'function') {
    drawInBands(context, layer, { rows, top, lean, start });

    return;
  }

  const count = rows.last - rows.first;

  context.save();
  context.transform(1, 0, lean, 1, start, top);
  context.drawImage(canvas, 0, rows.first, frame.width, count, 0, rows.first, frame.width, count);
  context.restore();
}
