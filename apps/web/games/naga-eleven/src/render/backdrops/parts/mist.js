import { hash } from '../hash.js';
import { artRect } from '../pen.js';
import { ART_WIDTH } from '../raster.js';
import { wispShape } from './mist-shape.js';

const wrap = (value, span) => ((value % span) + span) % span;

function wispOf(band, { i, blob, tick }) {
  const length = 60 + Math.floor(hash(i, blob, 1) * 90);
  const span = ART_WIDTH + length;
  const x = Math.round(wrap(hash(i, blob, 2) * span + tick * band.speed, span) - length);

  return {
    x,
    y: band.y + Math.floor(hash(i, blob, 3) * band.spread),
    shape: wispShape(i * 97 + blob, length),
  };
}

function paintRun(context, { left, right, y, color, mask }) {
  let from = left;

  for (let column = left; column <= right; column += 1) {
    const hidden = column < right && mask(column, y);

    if ((hidden || column === right) && column > from) {
      artRect(context, { x: from, y, width: column - from, height: 1 }, color);
    }

    if (hidden || column === right) {
      from = column + 1;
    }
  }
}

const open = () => false;

// slow banks of mist lying low over the fields and the water, drifting with the tick, each wisp a
// soft drift with a lumpy top and a flat foot, dithered out at its edges; `colors` [thin, thick],
// both see-through; `mask(x, y)` is true where something nearer than the mist stands, which the
// mist passes behind
export function drawMist(context, { bands, colors, tick, mask = open }) {
  bands.forEach((band, i) => {
    for (let blob = 0; blob < band.count; blob += 1) {
      const wisp = wispOf(band, { i, blob, tick });

      for (const run of wisp.shape) {
        paintRun(context, {
          left: wisp.x + run.from,
          right: wisp.x + run.to,
          y: wisp.y + run.row,
          color: colors[run.tone],
          mask,
        });
      }
    }
  });
}
