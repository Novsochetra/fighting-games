import { glow } from '../backdrops/dither.js';
import { hash } from '../backdrops/hash.js';
import { paintSky, paintStars } from '../backdrops/parts/sky.js';
import { fillRect, hline, plot, vline } from '../backdrops/raster.js';
import { ellipse } from '../backdrops/shapes.js';

// A stadium at night seen from the pitch: the far stand rising tier on tier, packed, under the
// roof and its banks of floodlights; the bigger the stage, the more tiers and lights, and flags
// along the roof. `art` is a palette of src/art/title/cards.js.

const PITCH_TOP = 140;

// a packed stand: rows of heads, a shirt colour here and there, the gangways dark
function crowdAt(art, { x, y, seed }) {
  const head = (x + Math.floor(y / 2)) % 2 === 0 && y % 2 === 0;

  if (!head || hash(seed, x, y) < 0.2) {
    return art.stand[y % 2];
  }

  return hash(seed, x, y, 2) > 0.55
    ? art.crowd[Math.floor(hash(seed, x >> 2, y, 3) * art.crowd.length)]
    : art.stand[2];
}

function paintTier(raster, { top, bottom, art, seed }) {
  fillRect(raster, { x: 0, y: top, width: raster.width, height: 2 }, art.stand[2]);

  for (let y = top + 2; y < bottom - 4; y += 1) {
    for (let x = 0; x < raster.width; x += 1) {
      plot(raster, x, y, crowdAt(art, { x, y, seed }));
    }
  }

  for (let x = 0; x < raster.width; x += 24) {
    fillRect(
      raster,
      { x, y: bottom - 4, width: 22, height: 4 },
      art.boards[(x / 24 + seed) % art.boards.length],
    );
  }
}

function paintRoof(raster, { top, art, banks }) {
  fillRect(raster, { x: 0, y: top - 8, width: raster.width, height: 10 }, art.roof[1]);
  hline(raster, { x: 0, y: top + 1, length: raster.width }, art.roof[2]);

  for (let bank = 0; bank < banks; bank += 1) {
    const x = Math.round(((bank + 0.5) / banks) * raster.width);

    glow(raster, {
      x,
      y: top - 4,
      radius: 22,
      colors: [art.sky[3], art.lights[0], art.lights[1]],
      squash: 0.6,
    });
    fillRect(raster, { x: x - 8, y: top - 7, width: 17, height: 5 }, art.lights[2]);
  }
}

function paintFlags(raster, { top, art }) {
  for (let x = 10; x < raster.width; x += 22) {
    const flag = art.flags.map((_, i) => art.flags[(i + x) % art.flags.length]);

    vline(raster, { x, y: top - 24, length: 16 }, art.roof[2]);
    [0, 1, 2].forEach((band) =>
      fillRect(raster, { x: x + 1, y: top - 24 + band * 3, width: 9, height: 3 }, flag[band]),
    );
  }
}

function paintPitch(raster, art) {
  for (let y = PITCH_TOP; y < raster.height; y += 1) {
    const stripe = Math.floor(Math.log(y - PITCH_TOP + 8) * 6) % 2;

    hline(raster, { x: 0, y, length: raster.width }, art.pitch[1 + stripe]);
  }

  hline(raster, { x: 0, y: PITCH_TOP + 3, length: raster.width }, art.line);
  vline(raster, { x: raster.width / 2, y: PITCH_TOP + 3, length: raster.height }, art.line);
  ellipse(raster, { x: raster.width / 2, y: 178, radiusX: 52, radiusY: 16 }, art.line);
  ellipse(raster, { x: raster.width / 2, y: 178, radiusX: 50, radiusY: 14 }, art.pitch[2]);
}

export const standTop = (tiers) => 92 - tiers * 16;

export function paintNightStadium(raster, { art, tiers, banks, flags = false }) {
  const roof = standTop(tiers);
  const height = (PITCH_TOP - roof) / tiers;

  paintSky(raster, { colors: art.sky, bottom: roof });
  paintStars(raster, { count: 30, bottom: roof - 10, colors: art.stars, seed: tiers });

  if (flags) {
    paintFlags(raster, { top: roof, art });
  }

  fillRect(raster, { x: 0, y: roof, width: raster.width, height: PITCH_TOP - roof }, art.stand[0]);

  for (let tier = 0; tier < tiers; tier += 1) {
    paintTier(raster, {
      top: Math.round(roof + tier * height),
      bottom: Math.round(roof + (tier + 1) * height),
      art,
      seed: tier + 1,
    });
  }

  paintRoof(raster, { top: roof, art, banks });
  paintPitch(raster, art);
}
