import { BOOTS, OUTLINE } from '../../../art/actors.js';
import { MATERIALS } from './buffer.js';

const tables = new WeakMap();

// a figure's codes turned to colours, once for each look: { shirt, shorts, socks, trim, skin,
// hair } are ramps of four, deep to light
export function coloursOf(look) {
  const kept = tables.get(look);

  if (kept) {
    return kept;
  }

  const ramps = { ...look, boots: BOOTS };
  const table = [null, ...MATERIALS.flatMap((material) => ramps[material]), OUTLINE, OUTLINE];

  tables.set(look, table);

  return table;
}

// a row of pixels alike goes down as one rect
function drawRow(context, buffer, { y, left, top, mirror, colours }) {
  const { width, codes } = buffer;
  let x = 0;

  while (x < width) {
    const code = codes[y * width + x];
    let end = x + 1;

    while (end < width && codes[y * width + end] === code) {
      end += 1;
    }

    if (code > 0) {
      context.fillStyle = colours[code];
      context.fillRect(mirror ? left + width - end : left + x, top + y, end - x, 1);
    }

    x = end;
  }
}

export function drawBuffer(context, buffer, { left, top, mirror = false, colours }) {
  for (let y = 0; y < buffer.height; y += 1) {
    drawRow(context, buffer, { y, left, top, mirror, colours });
  }
}

const channelsOf = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

const rgbTables = new WeakMap();

function rgbOf(colours) {
  if (!rgbTables.has(colours)) {
    rgbTables.set(
      colours,
      colours.map((colour) => colour && channelsOf(colour)),
    );
  }

  return rgbTables.get(colours);
}

// a sheet is baked straight into its pixels, which costs far less than a rect a run
export function paintBuffer(image, buffer, { left, top, colours }) {
  const rgb = rgbOf(colours);

  buffer.codes.forEach((code, at) => {
    if (code > 0) {
      const x = left + (at % buffer.width);
      const y = top + Math.floor(at / buffer.width);
      const to = (y * image.width + x) * 4;

      image.data.set(rgb[code], to);
      image.data[to + 3] = 255;
    }
  });
}
