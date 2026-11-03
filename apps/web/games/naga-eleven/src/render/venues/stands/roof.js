import { line, rect, tint } from '../kit/raster.js';

// a band of light between two tiers: a dark fascia with a row of coloured LED panels
export function paintRing(raster, { bottom, art, height }) {
  rect(raster, { x: 0, y: bottom - height, width: raster.width, height }, art.led.back);
  rect(raster, { x: 0, y: bottom - height, width: raster.width, height: 1 }, art.led.frame);

  for (let x = 6, i = 0; x < raster.width; x += 22, i += 1) {
    rect(
      raster,
      { x, y: bottom - height + 2, width: 14, height: height - 4 },
      art.ads[i % art.ads.length].back,
    );
  }

  return bottom - height;
}

const BANK = { width: 15, height: 6, glow: 26 };

// a bank of floodlights at night: a frame of lamps, white hot, in a halo of light that spills out
// into the dark and over the fans below
function paintLamp(raster, { x, y }, art) {
  for (let dy = -BANK.glow; dy <= BANK.glow; dy += 1) {
    for (let dx = -BANK.glow * 1.6; dx <= BANK.glow * 1.6; dx += 1) {
      const reach = Math.sqrt((dx / 1.6) ** 2 + dy * dy) / BANK.glow;

      tint(raster, x + dx, y + dy, {
        colour: art.glow,
        share: Math.max(0, 0.5 * (1 - reach) ** 2),
      });
    }
  }

  const left = x - Math.floor(BANK.width / 2);

  rect(
    raster,
    { x: left - 1, y: y - BANK.height - 1, width: BANK.width + 2, height: BANK.height + 2 },
    art.steel[0],
  );

  for (let row = 0; row < BANK.height; row += 2) {
    for (let column = 0; column < BANK.width; column += 2) {
      rect(raster, { x: left + column, y: y - BANK.height + row, width: 1, height: 1 }, art.lamp);
    }
  }

  rect(raster, { x: x - 1, y, width: 2, height: 4 }, art.steel[1]);
}

// the underside of a cantilevered roof: its steel ribs, then its lit front edge; `lamps` hangs
// floodlights along that edge, every so many pixels
export function paintRoof(raster, { bottom, art, lamps = 0 }) {
  rect(
    raster,
    { x: 0, y: Math.max(0, bottom - 14), width: raster.width, height: 14 },
    art.roofUnder[0],
  );

  for (let x = 0; x < raster.width; x += 12) {
    line(raster, { x, y: bottom - 1 }, { x: x + 12, y: bottom - 13 }, art.roofUnder[1]);
  }

  rect(raster, { x: 0, y: bottom - 3, width: raster.width, height: 3 }, art.roof[2]);
  rect(raster, { x: 0, y: bottom - 3, width: raster.width, height: 1 }, art.roof[3]);
  rect(raster, { x: 0, y: bottom - 1, width: raster.width, height: 1 }, art.roof[1]);

  for (let x = lamps / 2; lamps > 0 && x < raster.width; x += lamps) {
    paintLamp(raster, { x: Math.round(x), y: bottom + 1 }, art);
  }
}
