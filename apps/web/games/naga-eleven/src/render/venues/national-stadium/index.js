import { NATIONAL_STADIUM } from '../../../art/venues/national-stadium.js';
import { packAll } from '../kit/colour.js';
import { pitchside } from '../shared/pitchside.js';
import { standShadow } from '../shared/lighting.js';
import { paintClouds, paintSky } from '../shared/sky.js';
import { ledBoards, nearBoards, stadiumGoal, stadiumGround } from '../shared/stadium.js';
import { paintBowl } from '../stands/bowl.js';

const art = packAll(NATIONAL_STADIUM);
const AISLES = { every: 118, width: 7, offset: 40 };
const BOWL = {
  wall: 10,
  ring: 8,
  tiers: [
    { rows: 8, rowPitch: 9, size: 6, fill: 0.94, aisles: AISLES },
    { rows: 7, rowPitch: 6, size: 4, fill: 0.9, aisles: AISLES },
  ],
  shade: 0.42,
  shadeRows: 40,
};

function build(layout) {
  const stripes = { width: layout.pitch.length / 18, base: 3 };

  return {
    ground: stadiumGround(layout, { art, stripes, light: standShadow(layout) }),
    back: [
      {
        depth: -9000,
        base: -64,
        height: 'toTop',
        paint: (raster) => {
          paintSky(raster, { ramp: art.sky });
          paintClouds(raster, { ramp: art.cloud, row: 30 });
        },
      },
    ],
    far: [
      {
        depth: -64,
        height: 'toTop',
        frames: 4,
        paint: (raster, _, frame) => paintBowl(raster, { art, frame, plan: BOWL }),
      },
      ledBoards(art),
    ],
    goal: stadiumGoal(layout, art, NATIONAL_STADIUM.net),
    ...pitchside(layout, { cloth: art.flagCloth }),
    near: [nearBoards(layout, art)],
  };
}

export const nationalStadium = { id: 'national-stadium', sky: NATIONAL_STADIUM.sky[0], build };
