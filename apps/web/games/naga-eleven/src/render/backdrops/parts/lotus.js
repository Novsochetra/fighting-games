import { hline, plot } from '../raster.js';
import { ellipse } from '../shapes.js';

// lotus on the moat: flat leaves lying on the water and a few flowers standing up out of it,
// pink, half open; `colors` [leaf shade, leaf, petal, petal tip]
export function paintLotusLeaf(raster, { x, y, size, colors }) {
  ellipse(raster, { x, y, radiusX: size, radiusY: size * 0.32 }, colors[0]);
  ellipse(raster, { x, y: y - 1, radiusX: size - 1, radiusY: size * 0.32 - 1 }, colors[1]);
  plot(raster, x, y, colors[0]);
  plot(raster, x + 1, y - 1, colors[0]);
}

export function paintLotusFlower(raster, { x, y, height, colors }) {
  for (let row = 0; row < height; row += 1) {
    plot(raster, x, y - row, colors[0]);
  }

  const top = y - height;

  hline(raster, { x: x - 2, y: top, length: 5 }, colors[2]);
  hline(raster, { x: x - 2, y: top - 1, length: 5 }, colors[2]);
  plot(raster, x - 2, top - 2, colors[3]);
  plot(raster, x + 2, top - 2, colors[3]);
  hline(raster, { x: x - 1, y: top - 2, length: 3 }, colors[2]);
  plot(raster, x, top - 3, colors[3]);
  plot(raster, x - 3, top - 1, colors[2]);
  plot(raster, x + 3, top - 1, colors[2]);
}
