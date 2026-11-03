import { INNER } from '../../../duel/layout.js';
import { hash2 } from '../../../venues/kit/hash.js';
import { line, rect, tint } from '../../../venues/kit/raster.js';
import { paintSkyRamp } from '../sky.js';

// The top of the Asian stadium's bowl by night, as the venue's (stands/roof.js): a strip of the
// deep blue sky pricked with stars, the dark underside of the cantilevered roof on its steel ribs,
// its lit front edge, and banks of floodlights hung along it, white hot in halos that spill over
// the upper tier
export const ROOF = { top: 19, edge: 27 };
const BANKS = [22, 94, 162, 234];
const BANK = { width: 13, height: 5, glow: 22 };

function paintStars(raster, art) {
  for (let i = 0; i < 28; i += 1) {
    const x = Math.floor(hash2(i, 1, 61) * raster.width);
    const y = INNER.top + Math.floor(hash2(i, 2, 61) * (ROOF.top - INNER.top - 1));

    rect(raster, { x, y, width: 1, height: 1 }, hash2(i, 3, 61) < 0.25 ? art.star[1] : art.star[0]);
  }
}

function paintUnderside(raster, art) {
  const [deep] = art.roofUnder;
  const [, mid, light, edge] = art.roof;

  rect(raster, { x: 0, y: ROOF.top, width: raster.width, height: ROOF.edge - ROOF.top }, deep);
  rect(raster, { x: 0, y: ROOF.top, width: raster.width, height: 1 }, art.steel[1]);

  for (let x = -8; x < raster.width; x += 10) {
    line(raster, { x, y: ROOF.edge - 1 }, { x: x + 8, y: ROOF.top + 1 }, art.steel[0]);
  }

  rect(raster, { x: 0, y: ROOF.edge, width: raster.width, height: 1 }, edge);
  rect(raster, { x: 0, y: ROOF.edge + 1, width: raster.width, height: 1 }, light);
  rect(raster, { x: 0, y: ROOF.edge + 2, width: raster.width, height: 1 }, mid);
}

// the halo is wider than it is tall, as the light fans out down the stand
function paintHalo(raster, { x, y }, art) {
  for (let dy = -BANK.glow; dy <= BANK.glow * 1.4; dy += 1) {
    for (let dx = -BANK.glow * 1.8; dx <= BANK.glow * 1.8; dx += 1) {
      const reach = Math.hypot(dx / 1.8, dy / (dy > 0 ? 1.4 : 1)) / BANK.glow;

      tint(raster, x + dx, y + dy, {
        colour: art.glow,
        share: 0.7 * Math.max(0, 1 - reach) ** 1.6,
      });
    }
  }
}

// a frame of lamps a pixel apart, the middle row the hottest, on a hanger from the roof's edge
function paintBank(raster, x, art) {
  const left = x - Math.floor(BANK.width / 2);
  const top = ROOF.edge + 4;

  rect(raster, { x: x - 1, y: ROOF.edge + 3, width: 2, height: 1 }, art.steel[1]);
  rect(
    raster,
    { x: left - 1, y: top - 1, width: BANK.width + 2, height: BANK.height + 2 },
    art.steel[0],
  );

  for (let row = 0; row < BANK.height; row += 2) {
    for (let column = 0; column < BANK.width; column += 2) {
      rect(raster, { x: left + column, y: top + row, width: 1, height: 1 }, art.lamp);
    }
  }

  rect(raster, { x: left, y: top + 2, width: BANK.width, height: 1 }, art.glow);
}

export function paintNightRoof(raster, art) {
  paintSkyRamp(raster, { ramp: art.sky, to: ROOF.top + 2 });
  paintStars(raster, art);
  paintUnderside(raster, art);
}

// the lamps go up last, their light over all that stands under them
export function paintFloodlights(raster, art) {
  BANKS.forEach((x) => paintHalo(raster, { x, y: ROOF.edge + 6 }, art));
  BANKS.forEach((x) => paintBank(raster, x, art));
}
