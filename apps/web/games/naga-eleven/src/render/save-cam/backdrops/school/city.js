import { INNER } from '../../../duel/layout.js';
import { mix } from '../../../venues/kit/colour.js';
import { bayer, hash2 } from '../../../venues/kit/hash.js';
import { rect } from '../../../venues/kit/raster.js';

// Over the terraces: the low sun in its glow, Phnom Penh's towers in the evening haze, a few of
// their windows already lit, and the floodlight masts at the corners, not yet on
const SUN = { x: 54, y: 30 };
const GLOW = [5, 6.5, 9, 12.5];

// the sun low over the city, ringed in its own glow, each ring dithered into the next and the
// outermost only every other pixel, so the sky shows through it
function sunAt(dx, dy) {
  const distance = Math.hypot(dx / 1.2, dy) + (bayer(SUN.x + dx, SUN.y + dy) - 0.5) * 1.2;
  const ring = GLOW.findIndex((edge) => distance < edge);

  return ring === GLOW.length - 1 && bayer(SUN.x + dx, SUN.y + dy) > 0.5 ? -1 : ring;
}

export function paintSun(raster, art) {
  const reach = GLOW.at(-1) + 1;

  for (let dy = Math.max(-reach, INNER.top - SUN.y); dy <= reach; dy += 1) {
    for (let dx = -reach * 1.2; dx <= reach * 1.2; dx += 1) {
      const ring = sunAt(dx, dy);

      if (ring >= 0) {
        rect(raster, { x: SUN.x + dx, y: SUN.y + dy, width: 1, height: 1 }, art.sun[3 - ring]);
      }
    }
  }
}

// a block of the city: its face in the haze, lit on its left by the sun, its windows in rows
function paintBlock(raster, { x, top, width, ramp }, art) {
  const base = raster.height;

  rect(raster, { x, y: top, width, height: base - top }, ramp[1]);
  rect(raster, { x, y: top, width: 1, height: base - top }, ramp[2]);
  rect(raster, { x: x + width - 1, y: top, width: 1, height: base - top }, ramp[0]);

  for (let y = top + 2; y < 54; y += 3) {
    for (let column = x + 2; column < x + width - 2; column += 3) {
      const lit = hash2(column, y, 7) < 0.16;

      rect(raster, { x: column, y, width: 1, height: 1 }, lit ? art.window[1] : ramp[0]);
    }
  }
}

const TOWERS = [
  [-3, 40, 14],
  [10, 36, 11],
  [24, 42, 16],
  [79, 38, 12],
  [90, 33, 9],
  [102, 41, 15],
  [134, 37, 13],
  [150, 43, 18],
  [166, 27, 9],
  [176, 39, 14],
  [196, 35, 12],
  [214, 41, 17],
  [235, 36, 12],
  [248, 40, 12],
];

export function paintCity(raster, art) {
  TOWERS.forEach(([x, top, width], i) => {
    const ramp = art.city[i % art.city.length].map((colour) => mix(colour, art.haze, 0.3));

    paintBlock(raster, { x, top, width, ramp }, art);
  });

  rect(raster, { x: 170, y: 20, width: 1, height: 7 }, art.city[1][0]);
}

// a mast by day: a steel pole lit down its left, and up top a frame of grey lamps facing the pitch
export function paintMasts(raster, art) {
  for (const x of [9, 246]) {
    rect(raster, { x, y: 22, width: 2, height: 30 }, art.steel[1]);
    rect(raster, { x, y: 22, width: 1, height: 30 }, art.steel[2]);
    rect(raster, { x: x - 5, y: 15, width: 12, height: 7 }, art.steel[0]);

    for (let row = 0; row < 2; row += 1) {
      for (let lamp = 0; lamp < 4; lamp += 1) {
        rect(raster, { x: x - 4 + lamp * 3, y: 16 + row * 3, width: 2, height: 2 }, art.lamp[row]);
      }
    }
  }
}
