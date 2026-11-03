import { SAVE_CAM_PROVINCIAL } from '../../../art/save-cam/venues/provincial.js';
import { grainOf } from '../../venues/ground/grass.js';
import { packAll } from '../../venues/kit/colour.js';
import { rect } from '../../venues/kit/raster.js';
import { paintBannerWall } from './banners.js';
import { paintTier } from './crowd.js';
import { paintGround, paintLines } from './ground.js';
import { chalkOf, pitchAt } from './pitch.js';
import { paintCloud, paintSkyRamp } from './sky.js';
import { paintTreeLine } from '../../venues/scenery/tree.js';
import { toneOf } from './tone.js';
import { paintLeafyTree, paintPalm } from './village/trees.js';

// Kampong Cham's provincial ground on a hot afternoon, behind the goal: the blue wall hung with
// the ground's banners, the grass bank over it packed with fans standing in the sun, scooters
// parked along its top, and the trees and sugar palms of the town past it
const art = packAll(SAVE_CAM_PROVINCIAL);
const BANK = { top: 64, bottom: 89 };
const WALL = { top: BANK.bottom, bottom: 98 };
const FANS = { top: 70, rows: 4, pitch: 5, size: 3, fill: 0.6, legs: art.wall[0] };
const TREES = [-2, 30, 66, 104, 150, 190, 226, 258];
const PALMS = [
  [18, 40, 7],
  [86, 34, 6],
  [172, 44, 8],
  [240, 36, 6],
];

const bankTop = (x) => BANK.top + Math.round(Math.sin(x * 0.045) * 1.5 + Math.sin(x * 0.13 + 2));

// the town past the bank: a haze of far trees, sugar palms over them and leafy trees nearer
function paintTown(raster) {
  const tree = { trunk: art.wood, leaf: art.tree };

  paintTreeLine(raster, { bottom: BANK.top + 2, height: 12, salt: 5 }, art.haze);

  PALMS.forEach(([x, height, crown]) =>
    paintPalm(raster, { x, base: BANK.top + 2, height, crown }, art.palm),
  );
  TREES.forEach((x, i) =>
    paintLeafyTree(
      raster,
      { x, base: BANK.top + 3, width: 20 + (i % 3) * 4, height: 18 + (i % 2) * 5 },
      tree,
    ),
  );
}

function paintBank(raster) {
  for (let x = 0; x < raster.width; x += 1) {
    for (let y = bankTop(x); y < BANK.bottom; y += 1) {
      const down = (y - BANK.top) / (BANK.bottom - BANK.top);

      raster.pixels[y * raster.width + x] = toneOf(
        art.grass,
        5.4 - down * 2.4 + grainOf(x, y) * 0.7,
        x,
        y,
      );
    }
  }
}

// a scooter parked on the bank, side on: two tyres, its body in its colour, the seat and a lamp
function paintScooter(raster, { x, base }, ramp) {
  const { tyre, seat, chrome, light } = art.scooter;

  rect(raster, { x, y: base - 1, width: 2, height: 1 }, tyre);
  rect(raster, { x: x + 5, y: base - 1, width: 2, height: 1 }, tyre);
  rect(raster, { x: x + 1, y: base - 3, width: 5, height: 2 }, ramp[1]);
  rect(raster, { x: x + 1, y: base - 3, width: 5, height: 1 }, ramp[2]);
  rect(raster, { x: x + 1, y: base - 4, width: 3, height: 1 }, seat);
  rect(raster, { x: x + 5, y: base - 6, width: 1, height: 3 }, chrome);
  rect(raster, { x: x + 6, y: base - 5, width: 1, height: 1 }, light);
}

function paintScooters(raster) {
  for (let x = 4, i = 0; x < raster.width - 8; x += 9 + (i % 4) * 5, i += 1) {
    paintScooter(raster, { x, base: bankTop(x) + 1 }, art.scooters[i % art.scooters.length]);
  }
}

function paint(raster, frame) {
  paintSkyRamp(raster, { ramp: art.sky, to: 80 });
  paintCloud(raster, { x: 20, width: 56, base: 30, salt: 7 }, art.cloud);
  paintCloud(raster, { x: 170, width: 44, base: 22, salt: 8 }, art.cloud);
  paintTown(raster);
  paintBank(raster);
  paintScooters(raster);
  paintTier(raster, { tier: FANS, crowd: art.crowd, frame });
  paintBannerWall(raster, { ...WALL, wall: art.wall, banners: art.banners, at: [8, 98, 186] });
  paintGround(raster, (spot, column, row) => pitchAt(spot, column, row, { art, sand: true }), {
    top: WALL.bottom,
  });
  paintLines(raster, chalkOf(art));
}

export const PROVINCIAL_BACKDROP = {
  id: 'provincial-ground',
  paint,
  frameOf: (ticks) => (Math.floor(ticks / 13) % 3 === 2 ? 1 : 0),
  sky: 'day',
  goal: { ...SAVE_CAM_PROVINCIAL.goal, bamboo: false },
};
