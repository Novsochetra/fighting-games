import { columnOf, columnsAt, worldXOf } from '../layers/frame.js';
import { lineSpans } from './spans.js';

// fills a row of the ground from the venue's surface, then lays its lines over it
export function paintGroundRow(raster, row, { frame, surface, lines }) {
  const { from, to } = columnsAt(frame, row.scale);
  const start = row.index * raster.width;

  for (let column = from; column < to; column += 1) {
    raster.pixels[start + column] = surface(
      worldXOf(frame, column, row.scale),
      row.y,
      column,
      row.index,
    );
  }

  if (!lines) {
    return;
  }

  for (const [left, right] of lineSpans(lines.markings, row, lines.thick)) {
    const first = Math.max(from, columnOf(frame, left, row.scale));
    const last = Math.min(to, Math.max(first + 1, columnOf(frame, right, row.scale)));

    for (let column = first; column < last; column += 1) {
      raster.pixels[start + column] = lines.colour(
        column,
        row.index,
        raster.pixels[start + column],
      );
    }
  }
}
