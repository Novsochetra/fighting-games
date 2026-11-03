import { paintCrowd } from '../crowd/crowd.js';
import { columnOf } from '../layers/frame.js';
import { hash2, noise2 } from '../kit/hash.js';
import { rect } from '../kit/raster.js';
import { paintSugarPalm } from '../scenery/palm.js';
import { paintRoundTree } from '../scenery/tree.js';
import { paintUmbrella } from '../scenery/umbrella.js';
import { paintScooter, SCOOTER_LENGTH } from '../scenery/scooter.js';

// either side of the grandstand a bank of grass where fans stand in bunches, under umbrellas
// against the sun, and trees beyond
const BANK = 34;

function paintSlope(raster, art) {
  const top = raster.height - BANK;

  for (let y = top; y < raster.height; y += 1) {
    for (let x = 0; x < raster.width; x += 1) {
      const tone = 3 + ((y - top) / BANK) * 1.4 + (hash2(x, y, 91) < 0.12 ? -1 : 0);

      raster.pixels[y * raster.width + x] = art.grass[Math.min(6, Math.round(tone))];
    }
  }

  rect(raster, { x: 0, y: top, width: raster.width, height: 1 }, art.grass[5]);
}

function paintTrees(raster, { frame, layout, art }) {
  const base = raster.height - BANK + 2;

  for (let x = -300; x < layout.pitch.length + 300; x += 44) {
    const seed = hash2(x, 1, 93);
    const column = columnOf(frame, x) + Math.round(seed * 20);

    if (seed < 0.3) {
      paintSugarPalm(
        raster,
        { x: column, base, height: 56 + Math.round(seed * 60), crown: 11 },
        art.palm,
      );
    } else {
      paintRoundTree(
        raster,
        { x: column, base, height: 30 + Math.round(seed * 26), width: 26 + Math.round(seed * 18) },
        { trunk: art.wood, leaf: art.tree },
      );
    }
  }
}

function paintStandingFans(raster, { index, art }) {
  const area = { x: 0, y: raster.height - BANK + 4, width: raster.width, height: BANK - 6 };

  paintCrowd(raster, {
    area,
    size: 6,
    rowPitch: 9,
    palette: art.crowd,
    frame: index,
    filled: (x, row) =>
      noise2(x, row * 11, { cell: 40, salt: 9 }) > 0.44 && hash2(x, row, 95) < 0.8,
  });

  for (let x = 30; x < raster.width; x += 70) {
    if (noise2(x, 0, { cell: 34, salt: 9 }) > 0.6) {
      paintUmbrella(
        raster,
        { x, base: raster.height - 6 },
        { pole: art.steel[0], cloth: art.banners.map((banner) => banner.back) },
      );
    }
  }
}

export function paintBanks(raster, { frame, index, layout, art }) {
  paintTrees(raster, { frame, layout, art });
  paintSlope(raster, art);
  paintStandingFans(raster, { index, art });
}

// scooters parked nose to tail behind the wall, out of the way of the grandstand's gate
export function paintScooters(raster, { frame, layout, art }) {
  const gate = {
    from: columnOf(frame, layout.pitch.length * 0.28),
    to: columnOf(frame, layout.pitch.length * 0.72),
  };

  for (let x = 4; x < raster.width - SCOOTER_LENGTH; x += SCOOTER_LENGTH - 4) {
    const seed = hash2(x, 2, 97);
    const body = art.scooters[Math.floor(seed * art.scooters.length)];
    const facing = seed < 0.4 ? -1 : 1;

    if ((x < gate.from - SCOOTER_LENGTH || x > gate.to) && seed < 0.8) {
      paintScooter(raster, { x, base: raster.height - 1, facing }, { body, parts: art.scooter });
    }
  }
}
