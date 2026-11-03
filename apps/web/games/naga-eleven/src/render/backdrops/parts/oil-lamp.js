import { hash } from '../hash.js';
import { artRect } from '../pen.js';
import { fillRect, hline, plot, vline } from '../raster.js';

// a glass oil lamp, the kind on every village shelf: a brass foot, a round glass chimney and
// the flame inside it. `x`, `y` is the foot's middle at its bottom; `colors` = { brass: [shade,
// base, lit], glass: [edge, shine], flame }

export const flameOf = ({ x, y }) => ({ x, y: y - 12 });

export function paintOilLamp(raster, { x, y, colors }) {
  const [shade, base, lit] = colors.brass;

  fillRect(raster, { x: x - 4, y: y - 2, width: 9, height: 2 }, shade);
  hline(raster, { x: x - 3, y: y - 3, length: 7 }, base);
  fillRect(raster, { x: x - 2, y: y - 7, width: 5, height: 4 }, base);
  vline(raster, { x: x - 2, y: y - 7, length: 4 }, lit);
  hline(raster, { x: x - 3, y: y - 8, length: 7 }, shade);

  for (let row = 0; row < 9; row += 1) {
    const half = row < 2 || row > 6 ? 2 : 3;

    plot(raster, x - half, y - 9 - row, colors.glass[0]);
    plot(raster, x + half, y - 9 - row, colors.glass[0]);
  }

  vline(raster, { x: x - 2, y: y - 15, length: 4 }, colors.glass[1]);
}

// the flame changes shape a few times a second, never twice the same way in a row
export function drawFlame(context, { x, y, colors, tick }) {
  const flame = flameOf({ x, y });
  const tall = 3 + Math.floor(hash(Math.floor(tick / 5)) * 3);
  const lean = Math.floor(hash(Math.floor(tick / 5), 1) * 3) - 1;

  artRect(context, { x: flame.x - 1, y: flame.y, width: 3, height: 2 }, colors[2]);
  artRect(context, { x: flame.x, y: flame.y - tall + 2, width: 1, height: tall }, colors[1]);
  artRect(context, { x: flame.x, y: flame.y, width: 1, height: 1 }, colors[0]);
  artRect(context, { x: flame.x + lean, y: flame.y - tall + 1, width: 1, height: 1 }, colors[2]);
}
