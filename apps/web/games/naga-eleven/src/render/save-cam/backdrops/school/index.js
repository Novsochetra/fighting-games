import { SAVE_CAM_SCHOOL } from '../../../../art/save-cam/venues/school.js';
import { grainOf } from '../../../venues/ground/grass.js';
import { packAll } from '../../../venues/kit/colour.js';
import { paintGround, paintLines } from '../ground.js';
import { chalkOf, pitchAt } from '../pitch.js';
import { paintCloud, paintSkyRamp } from '../sky.js';
import { toneOf } from '../tone.js';
import { paintCity, paintMasts, paintSun } from './city.js';
import { paintTerraces, WALL } from './terraces.js';

// Phnom Penh's school stadium late in the afternoon, behind the goal: the red running track round
// the pitch, its net standing on the lanes, the red wall and the terraces of schoolchildren, the
// floodlight masts and the city's towers in the haze under a sunset sky. The children shift on
// the steps, a few standing up now and then
const art = packAll(SAVE_CAM_SCHOOL);
const TRACK = { from: 11.8, to: 15.2 };

// the low sun behind the terraces lays their shadow over the far end of the pitch
const light = ({ depth }) => (depth > 9.2 ? -1.3 : 0);

function surface(spot, column, row) {
  if (spot.depth < TRACK.from) {
    return pitchAt(spot, column, row, { art, light });
  }

  if (spot.depth < TRACK.to) {
    return row % 2 === 1
      ? art.line[1]
      : toneOf(art.track, 2.4 + grainOf(column, row) * 0.5, column, row);
  }

  return toneOf(art.concrete, 2 + grainOf(column, row) * 0.4, column, row);
}

function paint(raster, frame) {
  paintSkyRamp(raster, { ramp: art.sky, to: 46 });
  paintCloud(raster, { x: 120, width: 70, base: 22, salt: 4 }, art.cloud);
  paintCloud(raster, { x: 200, width: 40, base: 30, salt: 5 }, art.cloud);
  paintSun(raster, art);
  paintCity(raster, art);
  paintMasts(raster, art);
  paintTerraces(raster, { art, frame });
  paintGround(raster, surface, { top: WALL.bottom });
  paintLines(raster, chalkOf(art));
}

export const SCHOOL_BACKDROP = {
  id: 'city-school-stadium',
  paint,
  frameOf: (ticks) => (Math.floor(ticks / 14) % 3 === 2 ? 1 : 0),
  sky: 'day',
  goal: { ...SAVE_CAM_SCHOOL.goal, bamboo: false },
};
