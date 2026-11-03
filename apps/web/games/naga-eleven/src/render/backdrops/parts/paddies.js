import { mixes } from '../dither.js';
import { hash, smoothNoise } from '../hash.js';
import { copyPixel, plot } from '../raster.js';

// Rice paddies to the horizon, some flooded and holding the sky, some green with young rice,
// all boxed by earth dikes running to one vanishing point. `rows` are the dikes' heights on the
// view, horizon first; `columns` where the dikes that run away from us cross the bottom edge.
// `colors` = { rice: [far, mid, near, tip], dike: [shade, base, lit], ripple }.

const depthOf = (y, { horizon, bottom }) => (y - horizon) / (bottom - horizon);

const crossAt = (column, { vanish, horizon, bottom }, y) =>
  vanish + (column - vanish) * ((y - horizon) / (bottom - horizon));

function cellOf(x, y, field) {
  const row = field.rows.findIndex((top, i) => y >= top && y < (field.rows[i + 1] ?? Infinity));
  const column = field.columns.filter((at) => crossAt(at, field, y) <= x).length;

  return { row, column, top: field.rows[row] };
}

function onDike(x, y, field) {
  const depth = depthOf(y, field);
  const thick = 1 + Math.floor(depth * 2.5);
  const wobble = Math.round((smoothNoise(field.seed, x, 31) - 0.5) * depth * 4);
  const across = field.columns.some((at) => Math.abs(crossAt(at, field, y) - x) < thick * 0.5);
  const rowTop = field.rows.find((top) => y - wobble >= top && y - wobble < top + thick);

  if (rowTop !== undefined) {
    return y - wobble === rowTop ? 2 : 1;
  }

  return across ? 1 : -1;
}

function paintWater(raster, { x, y, field }) {
  const ripple = hash(field.seed, y) > 0.7 ? Math.sign(hash(field.seed, y, 2) - 0.5) : 0;
  const mirrored = Math.round(field.horizon - (y - field.horizon) * field.mirror);
  const wave = hash(field.seed, Math.floor(x / 9), y) > 0.82 - depthOf(y, field) * 0.2;

  copyPixel(
    raster,
    { x: Math.min(raster.width - 1, Math.max(0, x + ripple)), y: mirrored },
    { x, y },
  );

  if (wave && mixes(x, y, 0.5)) {
    plot(raster, x, y, field.colors.ripple);
  }
}

function paintRice(raster, { x, y, field, cell }) {
  const depth = depthOf(y, field);
  const rice = field.colors.rice;
  const spacing = 2 + Math.floor(depth * 4);
  const tuft = (x + cell.row * 3) % spacing === 0 && (y - cell.top) % 2 === 1;
  const base = depth < 0.12 ? rice[0] : rice[depth < 0.4 ? 1 : 2];

  plot(raster, x, y, tuft ? rice[3] : base);
}

export function paintPaddies(raster, field) {
  for (let y = field.horizon + 1; y < field.bottom; y += 1) {
    for (let x = 0; x < raster.width; x += 1) {
      const dike = onDike(x, y, field);

      if (dike >= 0) {
        plot(raster, x, y, field.colors.dike[dike]);
        continue;
      }

      const cell = cellOf(x, y, field);
      const flooded = hash(field.seed, cell.row, cell.column) < field.flooded;

      if (flooded) {
        paintWater(raster, { x, y, field });
      } else {
        paintRice(raster, { x, y, field, cell });
      }
    }
  }
}
