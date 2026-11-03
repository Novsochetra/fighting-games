import { SAVE_CAM_VILLAGE } from '../../../../art/save-cam/venues/village.js';
import { packAll } from '../../../venues/kit/colour.js';
import { paintGround, paintLines } from '../ground.js';
import { paintCloud, paintSkyRamp } from '../sky.js';
import { dikeAt, fieldAt, limeOf } from './field.js';
import { paintKids } from './kids.js';
import { PADDY_FROM, paddyAt } from './paddies.js';
import { paintHorizon, paintNearPalms, paintVillageRow } from './skyline.js';

// Chrey's village field behind the bamboo goal on a bright morning: the field worn to red earth
// in the goalmouth, a dike, the paddies running off to the village, its palms and stilt houses,
// the wat's spire in the haze, a sky of puffy clouds, kids watching from the dike and egrets
// flying over
const art = packAll(SAVE_CAM_VILLAGE);
const FIELD_END = 14.4;

const CLOUDS = [
  { x: 6, width: 44, base: 33, salt: 1 },
  { x: 146, width: 58, base: 25, salt: 2 },
  { x: 222, width: 30, base: 41, salt: 3 },
];

function surface(spot, column, row) {
  if (spot.depth < FIELD_END) {
    return fieldAt(spot, column, row, art);
  }

  return spot.depth < PADDY_FROM ? dikeAt(column, row, art) : paddyAt(spot, column, row, art);
}

function paint(raster, frame) {
  paintSkyRamp(raster, { ramp: art.sky, to: 88 });
  CLOUDS.forEach((cloud) => paintCloud(raster, cloud, art.cloud));
  paintHorizon(raster, art);
  paintGround(raster, surface);
  paintVillageRow(raster, art);
  paintNearPalms(raster, art);
  paintKids(raster, { art, frame });
  paintLines(raster, limeOf(art));
}

const EGRETS = [
  { x: 64, y: 30, phase: 0 },
  { x: 76, y: 26, phase: 5 },
  { x: 71, y: 35, phase: 9 },
];

// a few egrets crossing over the paddies, slowly, their wings beating in turn, on the show's clock
function drawEgrets(pen, ticks) {
  const [shade, white] = SAVE_CAM_VILLAGE.egret;

  for (const egret of EGRETS) {
    const x = Math.round(egret.x + ticks * 0.12);
    const up = Math.floor((ticks + egret.phase) / 9) % 2 === 0;

    pen.rect([x - 1, egret.y, 3, 1], white);
    pen.rect([x - 3, egret.y - (up ? 1 : -1), 2, 1], up ? white : shade);
    pen.rect([x + 2, egret.y - (up ? 1 : -1), 2, 1], up ? white : shade);
    pen.dot(x + 2, egret.y, shade);
  }
}

export const VILLAGE_BACKDROP = {
  id: 'village-field',
  paint,
  frameOf: (ticks) => (Math.floor(ticks / 15) % 3 === 2 ? 1 : 0),
  live: (pen, { ticks }) => drawEgrets(pen, ticks),
  goal: { ...SAVE_CAM_VILLAGE.goal, bamboo: true },
};
