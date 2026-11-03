import { fillRect, hline, plot } from '../raster.js';
import { ellipse, polygon } from '../shapes.js';

function paintTail(raster, { tail, y, base, stripe }) {
  polygon(raster, [tail - 30, y, tail - 14, y - 26, tail - 4, y - 26, tail - 8, y], base);
  polygon(
    raster,
    [tail - 22, y - 12, tail - 13, y - 22, tail - 9, y - 22, tail - 13, y - 12],
    stripe[0],
  );
  polygon(
    raster,
    [tail - 18, y - 6, tail - 11, y - 16, tail - 8, y - 16, tail - 11, y - 6],
    stripe[1],
  );
}

function paintWing(raster, { x, y, length, base, shade, lit }) {
  const root = x + length * 0.38;
  const engine = Math.round(x + length * 0.4);

  polygon(
    raster,
    [
      root,
      y + 4,
      root + length * 0.24,
      y + 4,
      root + length * 0.34,
      y + 12,
      root + length * 0.12,
      y + 12,
    ],
    base,
  );
  fillRect(raster, { x: engine, y: y + 9, width: 14, height: 7 }, shade);
  hline(raster, { x: engine, y: y + 9, length: 14 }, lit);
  [x + 20, x + length * 0.55].forEach((gearX) => {
    fillRect(raster, { x: Math.round(gearX), y: y + 7, width: 2, height: 8 }, shade);
  });
}

// an airliner at its stand, seen side on with its nose to the left: no airline's name, only a
// stripe of red and blue on the tail; `colors` = { body: [shade, base, lit, white], stripe }
export function paintPlane(raster, { x, y, length, colors }) {
  const [shade, base, lit, white] = colors.body;
  const tail = x + length;

  paintTail(raster, { tail, y, base, stripe: colors.stripe });
  fillRect(raster, { x: x + 8, y: y - 6, width: length - 14, height: 13 }, lit);
  ellipse(raster, { x: x + 9, y: y + 1, radiusX: 9, radiusY: 6.5 }, lit);
  hline(raster, { x: x + 4, y: y - 6, length: length - 10 }, white);
  fillRect(raster, { x: x + 4, y: y + 4, width: length - 12, height: 3 }, base);
  hline(raster, { x: x + 6, y: y + 7, length: length - 16 }, shade);

  for (let window = x + 20; window < tail - 32; window += 4) {
    plot(raster, window, y - 2, shade);
  }

  fillRect(raster, { x: x + 4, y: y - 3, width: 4, height: 2 }, shade);
  paintWing(raster, { x, y, length, base, shade, lit });
}
