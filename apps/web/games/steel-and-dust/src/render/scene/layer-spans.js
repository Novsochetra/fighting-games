// where a layer's painting starts on the screen, rounded as painted-backdrop.js lays it
export function layerOrigin({ image, parallax, once }, cameraX) {
  const offset = cameraX * parallax;

  return once
    ? Math.round(-offset)
    : Math.round(-(((offset % image.width) + image.width) % image.width));
}

// a band of rows of the painting laid at `y`; rows a move takes from above its top repeat its first
// row, as the trees go on above the screen
function drawRows(context, image, { sourceX, sourceY, width, height, x, y }) {
  const above = Math.min(height, Math.max(0, -sourceY));

  if (above > 0) {
    context.drawImage(image, sourceX, 0, width, 1, x, y, width, above);
  }

  if (height > above) {
    const rows = height - above;

    context.drawImage(image, sourceX, sourceY + above, width, rows, x, y + above, width, rows);
  }
}

// the columns of the painting a stretch of the screen takes from where it lies at `fromX`: a
// repeating layer across the seam where it starts again, a single painting only where it is
function piecesAlong(layer, { along, width }) {
  const size = layer.image.width;

  if (layer.once) {
    const from = Math.max(0, along);
    const to = Math.min(size, along + width);

    return to > from ? [{ sourceX: from, width: to - from, offset: from - along }] : [];
  }

  const sourceX = ((along % size) + size) % size;
  const first = Math.min(width, size - sourceX);
  const pieces = [{ sourceX, width: first, offset: 0 }];

  return first < width ? [...pieces, { sourceX: 0, width: width - first, offset: first }] : pieces;
}

// a rectangle of a layer laid on the still screen at `x, y`: taken from where the shake put the
// layer, and from `dx, dy` back from there when the rectangle has been moved by that much
export function drawLayerSpan(context, layer, { cameraX, shake, x, y, width, height, dx, dy }) {
  const along = x - shake.x - dx - layerOrigin(layer, cameraX);
  const sourceY = y - shake.y - dy;

  for (const piece of piecesAlong(layer, { along, width })) {
    drawRows(context, layer.image, {
      sourceX: piece.sourceX,
      sourceY,
      width: piece.width,
      height,
      x: x + piece.offset,
      y,
    });
  }
}
