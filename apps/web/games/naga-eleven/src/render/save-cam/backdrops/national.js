import { SAVE_CAM_NATIONAL } from '../../../art/save-cam/venues/national.js';
import { packAll } from '../../venues/kit/colour.js';
import { rect } from '../../venues/kit/raster.js';
import { paintTier } from './crowd.js';
import { paintGround, paintLines } from './ground.js';
import { chalkOf, pitchAt } from './pitch.js';
import { paintSkyRamp } from './sky.js';

// The national stadium by day, behind the goal: the bowl's white roof across the top of the view,
// curving down at its ends, the upper tier in the shade under it, the ring between the tiers, the
// lower tier in the sun, packed with red, blue and white, and the boards along the pitch
const art = packAll(SAVE_CAM_NATIONAL);
const AISLES = { every: 54, width: 4, offset: 22 };
const UPPER = { top: 29, rows: 7, pitch: 3, size: 2, fill: 0.86, aisles: AISLES };
const LOWER = { top: 57, rows: 8, pitch: 4, size: 3, fill: 0.9, aisles: AISLES };
const BOARDS = { top: 89, bottom: 98 };

const dipOf = (x) => Math.round(5 * ((x - 128) / 128) ** 2);

function paintRoof(raster) {
  const [deep, mid, light, edge] = art.roof;

  for (let x = 0; x < raster.width; x += 1) {
    const top = 17 + dipOf(x);

    rect(raster, { x, y: top, width: 1, height: UPPER.top - top }, art.roofUnder[0]);
    rect(raster, { x, y: top, width: 1, height: 1 }, edge);
    rect(raster, { x, y: top + 1, width: 1, height: 2 }, light);
    rect(raster, { x, y: top + 3, width: 1, height: 1 }, mid);
    rect(raster, { x, y: top + 4, width: 1, height: 1 }, deep);
  }

  for (let x = 6; x < raster.width; x += 14) {
    rect(
      raster,
      { x, y: 22 + dipOf(x), width: 1, height: UPPER.top - 22 - dipOf(x) },
      art.roofUnder[1],
    );
  }
}

function paintAisles(raster, tier) {
  for (let x = AISLES.every - AISLES.offset; x < raster.width; x += AISLES.every) {
    rect(
      raster,
      { x: x - 1, y: tier.top - 1, width: AISLES.width + 2, height: tier.rows * tier.pitch },
      art.concrete[2],
    );

    for (let y = tier.top; y < tier.top + tier.rows * tier.pitch; y += 2) {
      rect(raster, { x: x - 1, y, width: AISLES.width + 2, height: 1 }, art.concrete[3]);
    }
  }
}

// the concrete ring between the tiers, the stadium's flag colours in a band along it
function paintRing(raster) {
  const top = UPPER.top + UPPER.rows * UPPER.pitch - 1;

  rect(raster, { x: 0, y: top, width: raster.width, height: LOWER.top - top - 1 }, art.concrete[2]);
  rect(raster, { x: 0, y: top, width: raster.width, height: 1 }, art.concrete[4]);
  rect(raster, { x: 0, y: LOWER.top - 2, width: raster.width, height: 1 }, art.concrete[0]);

  art.flag.colours.forEach((colour, i) => {
    rect(raster, { x: 0, y: top + 2 + i, width: raster.width, height: 1 }, colour);
  });
}

// the boards along the pitch, the venue's own makers in panels of their colours
function paintBoards(raster) {
  rect(
    raster,
    { x: 0, y: BOARDS.top, width: raster.width, height: BOARDS.bottom - BOARDS.top },
    art.led.back,
  );
  rect(raster, { x: 0, y: BOARDS.top, width: raster.width, height: 1 }, art.led.frame);

  for (let x = -10, i = 0; x < raster.width; x += 46, i += 1) {
    const ad = art.ads[i % art.ads.length];

    rect(raster, { x, y: BOARDS.top + 2, width: 42, height: 5 }, ad.back);
    rect(raster, { x: x + 6, y: BOARDS.top + 4, width: 30, height: 1 }, ad.ink);
  }
}

function paint(raster, frame) {
  const seats = [art.seats.red, art.seats.blue];
  const tiers = { crowd: art.crowd, frame };

  paintSkyRamp(raster, { ramp: art.sky, to: 30 });
  paintRoof(raster);
  paintTier(raster, {
    ...tiers,
    tier: { ...UPPER, seats, riser: art.seats.shade },
    shade: { colour: art.roofUnder[1], share: 0.45 },
  });
  paintAisles(raster, UPPER);
  paintRing(raster);
  paintTier(raster, { ...tiers, tier: { ...LOWER, seats, riser: art.seats.shade } });
  paintAisles(raster, LOWER);
  paintBoards(raster);
  paintGround(raster, (spot, column, row) => pitchAt(spot, column, row, { art }), {
    top: BOARDS.bottom,
  });
  paintLines(raster, chalkOf(art));
}

export const NATIONAL_BACKDROP = {
  id: 'national-stadium',
  paint,
  frameOf: (ticks) => (Math.floor(ticks / 12) % 3 === 2 ? 1 : 0),
  goal: { ...SAVE_CAM_NATIONAL.goal, bamboo: false },
};
