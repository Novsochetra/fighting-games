import { rect, tint } from '../../../venues/kit/raster.js';
import { paintTier } from '../crowd.js';

// The Asian stadium's two tiers behind the goal, as the venue's bowl: the upper one in the roof's
// shade, the ring of LED panels in the championship's colours between them, the lower one lit
// gold by the floodlights, stairs down both, and the glowing boards along the pitch. In the
// second frame a few fans are up and the ring's panels have moved on a colour
const AISLES = { every: 62, width: 3, offset: 40 };
export const UPPER = { top: 32, rows: 6, pitch: 3, size: 2, fill: 0.84, aisles: AISLES };
export const RING = { top: UPPER.top + UPPER.rows * UPPER.pitch, height: 6 };
export const LOWER = {
  top: RING.top + RING.height + 2,
  rows: 8,
  pitch: 4,
  size: 3,
  fill: 0.9,
  aisles: AISLES,
};
export const BOARDS = { top: LOWER.top + LOWER.rows * LOWER.pitch, bottom: 99 };

function paintAisles(raster, { tier, art }) {
  const height = tier.rows * tier.pitch;

  for (let x = AISLES.every - AISLES.offset; x < raster.width; x += AISLES.every) {
    rect(raster, { x: x - 1, y: tier.top - 1, width: AISLES.width + 2, height }, art.concrete[1]);

    for (let y = tier.top; y < tier.top + height; y += 2) {
      rect(raster, { x: x - 1, y, width: AISLES.width + 2, height: 1 }, art.concrete[2]);
    }
  }
}

// the ring glows: its panels lay a little of their light on the rows over and under it
function paintRing(raster, { art, frame }) {
  const { top, height } = RING;

  rect(raster, { x: 0, y: top, width: raster.width, height }, art.led.back);
  rect(raster, { x: 0, y: top, width: raster.width, height: 1 }, art.led.frame);
  rect(raster, { x: 0, y: top + height - 1, width: raster.width, height: 1 }, art.led.frame);

  for (let x = -6, i = frame; x < raster.width; x += 20, i += 1) {
    const colour = art.ads[i % art.ads.length].back;

    rect(raster, { x, y: top + 2, width: 15, height: height - 4 }, colour);

    for (let column = x; column < x + 15; column += 1) {
      tint(raster, column, top - 1, { colour, share: 0.35 });
      tint(raster, column, top + height, { colour, share: 0.35 });
      tint(raster, column, top + height + 1, { colour, share: 0.15 });
    }
  }
}

// the boards along the pitch, the venue's makers in panels of their colours, lit from inside
function paintBoards(raster, art) {
  const { top, bottom } = BOARDS;

  rect(raster, { x: 0, y: top, width: raster.width, height: bottom - top }, art.led.back);
  rect(raster, { x: 0, y: top, width: raster.width, height: 1 }, art.concrete[3]);
  rect(raster, { x: 0, y: top + 1, width: raster.width, height: 1 }, art.led.frame);

  for (let x = -18, i = 0; x < raster.width; x += 50, i += 1) {
    const ad = art.ads[i % art.ads.length];

    rect(raster, { x, y: top + 2, width: 46, height: bottom - top - 3 }, ad.back);
    rect(raster, { x: x + 8, y: top + 4, width: 30, height: 1 }, ad.ink);
    rect(raster, { x: x + 8, y: top + 6, width: 18, height: 1 }, ad.ink);
  }
}

// the night over the fans, deepest at the back under the roof; what glows is painted after it
function paintNight(raster, art) {
  for (let y = UPPER.top - 3; y < BOARDS.top; y += 1) {
    const share = y < RING.top ? 0.62 - ((y - UPPER.top) / (RING.top - UPPER.top)) * 0.12 : 0.42;

    for (let x = 0; x < raster.width; x += 1) {
      tint(raster, x, y, { colour: art.shadow, share });
    }
  }
}

export function paintTiers(raster, { art, frame }) {
  const seats = [art.seats.blue, art.seats.red];
  const riser = art.seats.shade;

  rect(raster, { x: 0, y: UPPER.top - 3, width: raster.width, height: 3 }, art.concrete[2]);
  rect(raster, { x: 0, y: UPPER.top - 3, width: raster.width, height: 1 }, art.concrete[3]);
  paintTier(raster, { tier: { ...UPPER, seats, riser }, crowd: art.crowd, frame });
  paintAisles(raster, { tier: UPPER, art });
  rect(raster, { x: 0, y: LOWER.top - 2, width: raster.width, height: 2 }, art.concrete[2]);
  paintTier(raster, { tier: { ...LOWER, seats, riser }, crowd: art.crowd, frame });
  paintAisles(raster, { tier: LOWER, art });
  paintNight(raster, art);
}

// what glows of itself goes up after the night and the floodlights' halo, in its own colours
export function paintPanels(raster, { art, frame }) {
  paintRing(raster, { art, frame });
  paintBoards(raster, art);
}
