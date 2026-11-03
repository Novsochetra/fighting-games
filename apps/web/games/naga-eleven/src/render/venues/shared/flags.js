import { hash2 } from '../kit/hash.js';
import { rect } from '../kit/raster.js';

// a flag held up in the crowd: a pole and three bands of cloth that ripple a column at a time; each
// drawing of the crowd catches it at a new point of its wave, and higher when the crowd is up
const CLOTH = { width: 11, height: 7 };

function paintFlag(raster, { x, y, frame, seed }, colours) {
  const lift = frame >= 2 ? 3 : 0;
  const top = y - lift - 10;

  rect(raster, { x, y: top, width: 1, height: 12 }, colours[1]);

  for (let column = 0; column < CLOTH.width; column += 1) {
    const wave = Math.round(Math.sin(column * 0.7 + frame * 1.7 + seed * 6) * 1.2);
    const band = Math.ceil(CLOTH.height / 3);

    colours.forEach((colour, i) => {
      rect(raster, { x: x + 1 + column, y: top + wave + i * band, width: 1, height: band }, colour);
    });
  }
}

export function paintFlags(raster, { frame, every, flags, rows }) {
  for (let x = 20; x < raster.width - 20; x += every) {
    const seed = hash2(x, 0, 61);
    const y = rows.top + Math.floor(seed * (rows.bottom - rows.top));

    paintFlag(
      raster,
      { x: x + Math.round(seed * every * 0.5), y, frame, seed },
      flags[Math.floor(seed * flags.length)],
    );
  }
}
