import { fillRect, hline, plot } from '../raster.js';

// a power line sagging between two points, as Phnom Penh's tangle of them does over every street
export function paintWire(raster, { from, to, sag }, color) {
  const steps = Math.ceil(Math.abs(to.x - from.x)) * 2 + 1;

  for (let i = 0; i <= steps; i += 1) {
    const along = i / steps;

    plot(
      raster,
      from.x + (to.x - from.x) * along,
      from.y + (to.y - from.y) * along + sag * 4 * along * (1 - along),
      color,
    );
  }
}

// a concrete pole with its cross-arms and a transformer drum; returns where its wires hang
export function paintPole(raster, { x, ground, height, colors }) {
  const top = ground - height;

  fillRect(raster, { x, y: top, width: 3, height }, colors[0]);
  plot(raster, x + 2, top + 4, colors[1]);
  hline(raster, { x: x - 6, y: top + 5, length: 15 }, colors[0]);
  hline(raster, { x: x - 4, y: top + 11, length: 11 }, colors[0]);
  fillRect(raster, { x: x + 3, y: top + 16, width: 4, height: 7 }, colors[0]);

  return [
    { x: x - 6, y: top + 5 },
    { x: x + 8, y: top + 5 },
    { x: x - 4, y: top + 11 },
    { x: x + 6, y: top + 11 },
  ];
}
