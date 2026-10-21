// edges repeat instead of stretching, so the stones keep their hard pixels; the last tile is cut short
function spans(start, length, tile) {
  const out = [];
  for (let offset = 0; offset < length; offset += tile) {
    out.push({ offset: start + offset, size: Math.min(tile, length - offset) });
  }
  return out;
}

function axis(imageSize, before, after, destinationSize) {
  const tile = imageSize - before - after;
  return [
    { source: 0, size: before, offset: 0 },
    ...spans(before, destinationSize - before - after, tile).map(({ offset, size }) => ({
      source: before,
      size,
      offset,
    })),
    { source: imageSize - after, size: after, offset: destinationSize - after },
  ];
}

// the middle is left out: the HUD frames are hollow and each panel paints its own see-through fill
export function nineSlicePieces(image, slice, rect, scale) {
  const [top, right, bottom, left] = slice;
  const columns = axis(image.width, left, right, rect.width * scale);
  const rows = axis(image.height, top, bottom, rect.height * scale);
  const pieces = [];
  rows.forEach((row, rowIndex) => {
    columns.forEach((column, columnIndex) => {
      const middle = rowIndex > 0 && rowIndex < rows.length - 1;
      if (middle && columnIndex > 0 && columnIndex < columns.length - 1) {
        return;
      }
      pieces.push({
        source: [column.source, row.source, column.size, row.size],
        destination: [
          rect.x + column.offset / scale,
          rect.y + row.offset / scale,
          column.size / scale,
          row.size / scale,
        ],
      });
    });
  });
  return pieces;
}

export function drawNineSlice(context, image, { slice, rect, scale }) {
  for (const { source, destination } of nineSlicePieces(image, slice, rect, scale)) {
    context.drawImage(image, ...source, ...destination);
  }
}
