import { hash } from '../hash.js';
import { fillRect, hline, plot, vline } from '../raster.js';

// A Phnom Penh shophouse: a shop open on the street under its signboard, balconies above with
// shutters, plants and an air conditioner, a flat roof with a water tank. Seen against the
// sunset: the face in shadow, lit windows, a rim of light on the edge toward the sun.
// `colors` = { walls: [[shade, base, rim]], dark, rail, lit, signs, plant }

const SHOP = 18;
const FLOOR = 16;

function paintShop(raster, { x, ground, width, colors, seed }) {
  fillRect(raster, { x: x + 1, y: ground - SHOP, width: width - 2, height: SHOP }, colors.dark);

  for (let item = x + 3; item < x + width - 3; item += 2) {
    const shelf = ground - 4 - Math.floor(hash(seed, item) * 8);

    plot(raster, item, shelf, colors.signs[Math.floor(hash(seed, item, 2) * colors.signs.length)]);
  }

  fillRect(
    raster,
    { x, y: ground - SHOP - 5, width, height: 5 },
    colors.signs[seed % colors.signs.length],
  );

  for (let letter = x + 3; letter < x + width - 3; letter += 1) {
    if (hash(seed, letter, 3) > 0.5) {
      plot(raster, letter, ground - SHOP - 3, colors.lit[0]);
    }
  }

  if (hash(seed, 9) > 0.5) {
    fillRect(raster, { x: x + 1, y: ground - SHOP, width: width - 2, height: 7 }, colors.rail);

    for (let slat = ground - SHOP + 1; slat < ground - SHOP + 7; slat += 2) {
      hline(raster, { x: x + 1, y: slat, length: width - 2 }, colors.dark);
    }
  }
}

function paintFloor(raster, { x, top, width, wall, colors, seed }) {
  const windows = width > 30 ? 2 : 1;

  for (let i = 0; i < windows; i += 1) {
    const paneX = Math.round(x + ((i + 0.5) * width) / windows) - 4;
    const lit = hash(seed, top, i) > 0.55;

    fillRect(
      raster,
      { x: paneX, y: top + 3, width: 8, height: 9 },
      lit ? colors.lit[Math.floor(hash(seed, i) * 3)] : colors.dark,
    );
    vline(raster, { x: paneX + 4, y: top + 3, length: 9 }, wall[0]);
  }

  hline(raster, { x: x - 1, y: top + FLOOR - 1, length: width + 2 }, wall[2]);

  for (let post = x; post < x + width; post += 2) {
    vline(raster, { x: post, y: top + FLOOR - 5, length: 4 }, colors.rail);
  }

  hline(raster, { x, y: top + FLOOR - 6, length: width }, colors.rail);

  if (hash(seed, top, 7) > 0.6) {
    fillRect(raster, { x: x + width - 9, y: top + 5, width: 7, height: 5 }, colors.rail);
  }

  if (hash(seed, top, 8) > 0.5) {
    fillRect(raster, { x: x + 2, y: top + FLOOR - 9, width: 5, height: 3 }, colors.plant);
  }
}

export function paintShophouse(
  raster,
  { x, ground, width, floors, colors, seed = 1, rimSide = 1 },
) {
  const wall = colors.walls[seed % colors.walls.length];
  const top = ground - SHOP - 5 - floors * FLOOR;

  fillRect(raster, { x, y: top, width, height: ground - top }, wall[1]);
  vline(raster, { x: rimSide > 0 ? x + width - 1 : x, y: top, length: ground - top }, wall[2]);
  hline(raster, { x, y: top, length: width }, wall[2]);
  fillRect(raster, { x: x - 1, y: top - 2, width: width + 2, height: 2 }, wall[0]);

  if (hash(seed, 11) > 0.55) {
    fillRect(raster, { x: x + 4, y: top - 8, width: 8, height: 6 }, wall[0]);
  }

  for (let floor = 0; floor < floors; floor += 1) {
    paintFloor(raster, { x, top: top + floor * FLOOR, width, wall, colors, seed });
  }

  paintShop(raster, { x, ground, width, colors, seed });
}
