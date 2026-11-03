import { PROVINCIAL_GROUND } from '../../../art/venues/provincial-ground.js';
import { mownGrass } from '../ground/grass.js';
import { packAll } from '../kit/colour.js';
import { pitchside } from '../shared/pitchside.js';
import { standShadow } from '../shared/lighting.js';
import { wornGoalmouths } from '../shared/wear.js';
import { paintClouds, paintSky } from '../shared/sky.js';
import { stadiumGoal, stadiumGround } from '../shared/stadium.js';
import { paintBanks, paintScooters } from './banks.js';
import { paintGrandstand } from './stand.js';
import { paintBannerWall } from '../shared/banner-wall.js';
import { bannersOf } from '../shared/team-banners.js';

const art = packAll(PROVINCIAL_GROUND);

const sky = {
  depth: -9000,
  base: -70,
  height: 'toTop',
  paint: (raster) => {
    paintSky(raster, { ramp: art.sky });
    paintClouds(raster, { ramp: art.cloud, row: 40, every: 220, salt: 9 });
  },
};

const farLayers = (layout) => [
  {
    depth: -70,
    height: 'toTop',
    frames: 4,
    paint: (raster, frame, index) => paintBanks(raster, { frame, index, layout, art }),
  },
  {
    depth: -56,
    height: 'toTop',
    frames: 4,
    paint: (raster, frame, index) => paintGrandstand(raster, { frame, index, layout, art }),
  },
  {
    depth: -34,
    height: 30,
    paint: (raster, frame) => paintScooters(raster, { frame, layout, art }),
  },
  {
    depth: -22,
    height: 26,
    paint: (raster) =>
      paintBannerWall(raster, { art: { ...art, banners: bannersOf(layout, art) } }),
  },
];

function build(layout) {
  const stripes = { width: layout.pitch.length / 14, base: 3 };
  const grass = mownGrass({
    ramp: art.grass,
    pitch: layout.pitch,
    stripes,
    light: standShadow(layout, { reach: 20, slope: 30, depth: 1.2 }),
    rough: 1.2,
  });

  return {
    ground: stadiumGround(layout, { art, surface: wornGoalmouths(layout, art, grass) }),
    back: [sky],
    far: farLayers(layout),
    goal: stadiumGoal(layout, art, PROVINCIAL_GROUND.net),
    ...pitchside(layout, { cloth: art.flagCloth, press: false }),
    near: [
      {
        depth: layout.pitch.width + 40,
        height: 14,
        paint: (raster) => paintBannerWall(raster, { art: { ...art, banners: [] } }),
      },
    ],
  };
}

export const provincialGround = { id: 'provincial-ground', sky: PROVINCIAL_GROUND.sky[0], build };
