import { createRaster, fillRect, hline, plot, stampRaster, vline } from '../raster.js';
import { disc, line, ring } from '../shapes.js';
import { paintFigure } from './figures.js';

// A remork, Phnom Penh's tuk-tuk: a motorbike pulling a two-wheeled carriage under a fringed
// canopy. Painted facing right in its own small buffer, then laid down facing either way.
// `colors` = { dark, rim, canopy: [shade, base], lit }

const WIDTH = 52;
const HEIGHT = 30;

function paintWheel(raster, { x, y, colors }) {
  disc(raster, { x, y, radius: 4 }, colors.dark);
  ring(raster, { x, y, radius: 2 }, colors.canopy[0]);
  plot(raster, x, y - 4, colors.rim);
  plot(raster, x - 1, y - 4, colors.rim);
}

function paintCarriage(raster, colors) {
  const ground = HEIGHT - 1;

  fillRect(raster, { x: 1, y: ground - 13, width: 28, height: 7 }, colors.dark);
  hline(raster, { x: 1, y: ground - 13, length: 28 }, colors.rim);
  [2, 27].forEach((post) => vline(raster, { x: post, y: ground - 24, length: 11 }, colors.dark));
  fillRect(raster, { x: 4, y: ground - 20, width: 3, height: 7 }, colors.canopy[0]);
  fillRect(raster, { x: 20, y: ground - 20, width: 3, height: 7 }, colors.canopy[0]);
  fillRect(raster, { x: 0, y: ground - 28, width: 31, height: 4 }, colors.canopy[1]);
  hline(raster, { x: 0, y: ground - 28, length: 31 }, colors.rim);

  for (let fringe = 0; fringe < 31; fringe += 2) {
    plot(raster, fringe, ground - 24, colors.canopy[0]);
  }

  line(raster, { from: { x: 29, y: ground - 8 }, to: { x: 35, y: ground - 8 } }, colors.dark);
  paintWheel(raster, { x: 14, y: ground - 4, colors });
}

function paintBike(raster, colors) {
  const ground = HEIGHT - 1;

  paintWheel(raster, { x: 36, y: ground - 4, colors });
  paintWheel(raster, { x: 47, y: ground - 4, colors });
  fillRect(raster, { x: 34, y: ground - 11, width: 10, height: 4 }, colors.dark);
  line(raster, { from: { x: 44, y: ground - 15 }, to: { x: 47, y: ground - 4 } }, colors.dark);
  hline(raster, { x: 42, y: ground - 16, length: 4 }, colors.rim);
  fillRect(raster, { x: 47, y: ground - 13, width: 2, height: 2 }, colors.lit);
  paintFigure(raster, {
    x: 39,
    ground: ground - 8,
    height: 15,
    colors: [colors.dark, colors.rim],
    toward: { x: -1, y: -1 },
  });
}

export function paintTukTuk(raster, { x, ground, facing = 1, colors }) {
  const own = createRaster(WIDTH, HEIGHT);

  paintCarriage(own, colors);
  paintBike(own, colors);
  stampRaster(raster, own, { x, y: ground - HEIGHT + 1, flipX: facing < 0 });
}
