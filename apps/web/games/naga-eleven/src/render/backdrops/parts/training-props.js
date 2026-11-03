import { fillRect, hline, plot, vline } from '../raster.js';
import { polygon } from '../shapes.js';

// a training cone with its white band and a shadow thrown long by the low sun; `colors`
// [shade, base, lit, band]
export function paintCone(raster, { x, ground, height, colors, shadow }) {
  hline(raster, { x: x + 1, y: ground, length: height + 2 }, shadow);

  for (let row = 0; row < height; row += 1) {
    const half = Math.round((row / height) * (height * 0.42)) + 1;
    const y = ground - height + row + 1;
    const band = row === Math.round(height * 0.45);

    hline(raster, { x: x - half, y, length: half * 2 }, band ? colors[3] : colors[1]);
    plot(raster, x - half, y, band ? colors[3] : colors[2]);
    plot(raster, x + half - 1, y, colors[0]);
  }

  hline(
    raster,
    { x: x - Math.round(height * 0.5), y: ground, length: Math.round(height) },
    colors[0],
  );
}

// a floodlight mast: a lattice of light at the top of a steel pole
export function paintMast(raster, { x, ground, height, colors }) {
  const top = ground - height;

  fillRect(raster, { x, y: top, width: 2, height }, colors[0]);
  vline(raster, { x, y: top, length: height }, colors[1]);
  fillRect(raster, { x: x - 7, y: top - 8, width: 16, height: 8 }, colors[0]);

  for (let lamp = 0; lamp < 8; lamp += 2) {
    hline(raster, { x: x - 6, y: top - 7 + lamp, length: 14 }, colors[2]);
  }
}

// a covered bench: a curved shell over a row of seats, seen from the pitch
export function paintDugout(raster, { x, ground, width, colors }) {
  const top = ground - 22;

  polygon(
    raster,
    [x, ground, x, top + 4, x + 4, top, x + width - 4, top, x + width, top + 4, x + width, ground],
    colors.shell[1],
  );
  fillRect(raster, { x: x + 2, y: top + 3, width: width - 4, height: 19 }, colors.shell[0]);

  for (let seat = x + 4; seat < x + width - 6; seat += 6) {
    fillRect(raster, { x: seat, y: ground - 9, width: 5, height: 5 }, colors.seat[1]);
    hline(raster, { x: seat, y: ground - 9, length: 5 }, colors.seat[2]);
    fillRect(raster, { x: seat, y: ground - 4, width: 5, height: 2 }, colors.seat[0]);
  }

  hline(raster, { x: x + 4, y: top, length: width - 8 }, colors.shell[2]);
}
