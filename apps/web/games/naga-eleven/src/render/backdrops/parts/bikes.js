import { hline, plot } from '../raster.js';
import { line, ring } from '../shapes.js';

// a schoolchild's bicycle seen from the side, `colors` = { metal: [dark, mid, light], frame }
export function paintBike(raster, { x, ground, colors }) {
  const hub = ground - 5;
  const points = {
    rear: { x, y: hub },
    crank: { x: x + 7, y: hub },
    seat: { x: x + 5, y: ground - 12 },
    head: { x: x + 13, y: ground - 13 },
    front: { x: x + 16, y: hub },
  };

  [points.rear, points.front].forEach((wheel) => {
    ring(raster, { ...wheel, radius: 5 }, colors.metal[0]);
    ring(raster, { ...wheel, radius: 4 }, colors.metal[1]);
    plot(raster, wheel.x, wheel.y, colors.metal[2]);
  });
  [
    [points.rear, points.crank],
    [points.rear, points.seat],
    [points.crank, points.seat],
    [points.seat, points.head],
    [points.crank, points.head],
    [points.head, points.front],
  ].forEach(([from, to]) => line(raster, { from, to }, colors.frame));
  hline(raster, { x: x + 3, y: ground - 13, length: 4 }, colors.metal[0]);
  hline(raster, { x: x + 12, y: ground - 15, length: 4 }, colors.metal[2]);
  line(raster, { from: { x: x + 13, y: ground - 15 }, to: points.head }, colors.metal[1]);
}

// a rack of bikes parked side by side behind a steel rail
export function paintBikeRack(raster, { x, ground, count, colors }) {
  for (let i = 0; i < count; i += 1) {
    paintBike(raster, {
      x: x + i * 12,
      ground: ground + (i % 2),
      colors: { metal: colors.metal, frame: colors.frames[i % colors.frames.length] },
    });
  }

  hline(raster, { x: x - 4, y: ground - 8, length: count * 12 + 16 }, colors.metal[2]);
  hline(raster, { x: x - 4, y: ground - 7, length: count * 12 + 16 }, colors.metal[0]);
  [x - 4, x + count * 12 + 11].forEach((postX) =>
    line(
      raster,
      { from: { x: postX, y: ground - 8 }, to: { x: postX, y: ground } },
      colors.metal[1],
    ),
  );
}
