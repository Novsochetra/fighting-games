const kept = new WeakMap();

// a sheet is drawn every frame, so it keeps the default context it was painted with and is read
// back only here, once: read again, a browser warns and moves it off the graphics card
function pixelsOf(sheet) {
  if (!kept.has(sheet)) {
    const context = sheet.getContext?.('2d');
    const image = context ? context.getImageData(0, 0, sheet.width, sheet.height) : null;

    kept.set(sheet, { image, frames: new Map() });
  }

  return kept.get(sheet);
}

const isPainted = (image, x, y) => image.data[(y * image.width + x) * 4 + 3] > 0;

function rowRuns(image, box, row) {
  const runs = [];
  let start = -1;

  for (let column = 0; column <= box.width; column += 1) {
    const painted = column < box.width && isPainted(image, box.x + column, box.y + row);

    if (painted && start < 0) {
      start = column;
    } else if (!painted && start >= 0) {
      runs.push([start, row, column - start]);
      start = -1;
    }
  }

  return runs;
}

// a frame of a sheet as runs of painted pixels, [x, y, width] from the frame's corner, worked out
// once a frame, so its shape is painted a rect a run in any colour; null for a sheet that is an
// image, which has no pixels to read
export function frameRuns(sheet, box) {
  const known = pixelsOf(sheet);

  if (!known.image) {
    return null;
  }

  const key = `${box.x}:${box.y}`;

  if (!known.frames.has(key)) {
    const rows = Array.from({ length: box.height }, (_, row) => rowRuns(known.image, box, row));

    known.frames.set(key, rows.flat());
  }

  return known.frames.get(key);
}
