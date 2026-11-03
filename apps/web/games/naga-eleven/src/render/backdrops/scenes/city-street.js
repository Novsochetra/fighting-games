import { CITY_STREET_ART } from '../../../art/backdrops/city.js';
import { glow } from '../dither.js';
import { hash } from '../hash.js';
import { paintStreak } from '../parts/clouds.js';
import { drawTwinkles } from '../parts/drift.js';
import { paintShophouse } from '../parts/shophouse.js';
import { paintSky, paintSun } from '../parts/sky.js';
import { paintTukTuk } from '../parts/tuk-tuk.js';
import { paintPole, paintWire } from '../parts/wires.js';
import { fillRect, hline } from '../raster.js';

// Phnom Penh at sunset, the boys' first sight of the capital: shophouses either side of a cross
// street the sun is setting down, tuk-tuks, and the wires strung over it all
const art = CITY_STREET_ART;
const STREET = 150;
const SUN = { x: 199, y: 104 };
const LEFT = [
  [-4, 34, 3],
  [30, 30, 4],
  [60, 38, 3],
  [98, 36, 2],
  [134, 36, 3],
];
const RIGHT = [
  [228, 32, 3],
  [260, 36, 4],
  [296, 30, 2],
  [326, 34, 3],
  [360, 30, 4],
];

function paintSkyline(raster) {
  paintSky(raster, { colors: art.sky, bottom: STREET });
  paintSun(raster, { ...SUN, radius: 11, colors: art.sun, glowRadius: 96, squash: 0.6 });
  [
    [10, 40, 130, 6, 1],
    [220, 28, 150, 7, 2],
    [120, 70, 110, 4, 3],
    [260, 82, 90, 4, 4],
  ].forEach(([x, y, width, thickness, seed]) => {
    paintStreak(raster, { x, y, width, thickness, colors: art.cloud, seed });
  });

  for (let x = 150; x < 250; x += 9) {
    const nearSun = Math.abs(x + 4 - SUN.x) < 16;
    const height = (nearSun ? 2 : 10) + Math.floor(hash(x, 4) * (nearSun ? 6 : 26));

    fillRect(
      raster,
      { x, y: STREET - 18 - height, width: 7 + Math.floor(hash(x, 5) * 5), height: height + 18 },
      art.far[hash(x, 6) > 0.5 ? 1 : 0],
    );
  }
}

function paintStreet(raster) {
  fillRect(
    raster,
    { x: 0, y: STREET, width: raster.width, height: raster.height - STREET },
    art.road[1],
  );
  glow(raster, {
    x: SUN.x,
    y: STREET + 4,
    radius: 120,
    colors: [art.road[2], art.road[3]],
    squash: 0.22,
  });
  fillRect(raster, { x: 0, y: STREET, width: 170, height: 4 }, art.road[2]);
  fillRect(raster, { x: 228, y: STREET, width: 156, height: 4 }, art.road[2]);
  hline(raster, { x: 0, y: STREET + 4, length: raster.width }, art.road[0]);

  for (let x = 4; x < raster.width; x += 16) {
    hline(raster, { x, y: 186, length: 8 }, art.road[2]);
  }
}

function paintWires(raster) {
  const poleColors = [art.wire, art.walls[0][2]];
  const left = paintPole(raster, { x: 54, ground: STREET + 2, height: 96, colors: poleColors });
  const right = paintPole(raster, { x: 318, ground: STREET + 2, height: 92, colors: poleColors });

  left.forEach((from, i) => {
    paintWire(raster, { from, to: right[i], sag: 10 + i * 3 }, art.wire);
    paintWire(raster, { from: { x: -2, y: from.y + 6 + i }, to: from, sag: 4 }, art.wire);
    paintWire(raster, { from: right[i], to: { x: 386, y: right[i].y + 8 - i }, sag: 4 }, art.wire);
  });
  paintWire(raster, { from: left[1], to: { x: 240, y: 152 }, sag: 6 }, art.wire);
}

function paintRows(raster) {
  [
    [LEFT, 1, 1],
    [RIGHT, 7, -1],
  ].forEach(([row, firstSeed, rimSide]) => {
    row.forEach(([x, width, floors], i) => {
      paintShophouse(raster, {
        x,
        ground: STREET,
        width,
        floors,
        colors: art,
        seed: firstSeed + i,
        rimSide,
      });
    });
  });
}

function paintTraffic(raster) {
  [
    { x: 74, ground: 182, facing: 1, rim: art.walls[1][2], canopy: art.canopy.slice(0, 2) },
    { x: 244, ground: 170, facing: -1, rim: art.walls[0][2], canopy: art.canopy.slice(2) },
  ].forEach(({ rim, canopy, ...place }) => {
    paintTukTuk(raster, { ...place, colors: { dark: art.dark, rim, canopy, lit: art.lit[0] } });
  });
}

export const CITY_STREET = {
  paint: (raster) => {
    paintSkyline(raster);
    paintStreet(raster);
    paintRows(raster);
    paintWires(raster);
    paintTraffic(raster);
  },
  overlay: (context, tick) => {
    drawTwinkles(context, {
      points: [
        { x: 123, y: 105, width: 3, height: 1 },
        { x: 270, y: 108, width: 3, height: 1 },
      ],
      colors: [art.lit[0], art.signs[0], art.lit[1]],
      tick,
      period: 30,
    });
  },
};
