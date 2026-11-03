import { CITY_SCHOOL_STADIUM } from '../../../art/venues/city-school-stadium.js';
import { mownGrass } from '../ground/grass.js';
import { standShadow } from '../shared/lighting.js';
import { wornGoalmouths } from '../shared/wear.js';
import { packAll } from '../kit/colour.js';
import { pitchside } from '../shared/pitchside.js';
import { paintCity } from '../scenery/skyline.js';
import { paintBannerWall } from '../shared/banner-wall.js';
import { bannersOf } from '../shared/team-banners.js';
import { paintClouds, paintSky } from '../shared/sky.js';
import { stadiumGoal, stadiumGround } from '../shared/stadium.js';
import { paintMasts, paintTerraces } from './terraces.js';
import { TRACK_OUTER, trackSurface } from './track.js';

const art = packAll(CITY_SCHOOL_STADIUM);
const WALL_DEPTH = -(TRACK_OUTER + 6);

const backLayers = (layout) => [
  {
    depth: -9000,
    base: WALL_DEPTH - 4,
    height: 'toTop',
    paint: (raster) => {
      paintSky(raster, { ramp: art.sky });
      paintClouds(raster, { ramp: art.cloud, row: 24, every: 280, salt: 6 });
    },
  },
  {
    depth: -2400,
    base: WALL_DEPTH - 4,
    height: 120,
    paint: (raster) => paintCity(raster, { salt: 4, art }),
  },
  {
    depth: -160,
    base: WALL_DEPTH - 4,
    height: 'toTop',
    paint: (raster, frame) => paintMasts(raster, { frame, layout, art }),
  },
];

function build(layout) {
  const stripes = { width: layout.pitch.length / 16, base: 3 };
  const light = standShadow(layout, { reach: 150, slope: -90, depth: 1.6 });
  const grass = wornGoalmouths(
    layout,
    art,
    mownGrass({ ramp: art.grass, pitch: layout.pitch, stripes, light }),
  );

  return {
    ground: {
      ...stadiumGround(layout, { art }),
      far: WALL_DEPTH - 8,
      surface: trackSurface(layout, art, grass),
    },
    back: backLayers(layout),
    far: [
      {
        depth: WALL_DEPTH - 4,
        height: 'toTop',
        frames: 4,
        paint: (raster, _, index) => paintTerraces(raster, { index, art }),
      },
      {
        depth: WALL_DEPTH,
        height: 26,
        paint: (raster) =>
          paintBannerWall(raster, { art: { ...art, banners: bannersOf(layout, art) } }),
      },
    ],
    goal: stadiumGoal(layout, art, CITY_SCHOOL_STADIUM.net),
    ...pitchside(layout, { cloth: art.flagCloth, press: false }),
    near: [
      {
        depth: layout.pitch.width + TRACK_OUTER + 6,
        height: 14,
        paint: (raster) => paintBannerWall(raster, { art: { ...art, banners: [] } }),
      },
    ],
  };
}

export const citySchoolStadium = {
  id: 'city-school-stadium',
  sky: CITY_SCHOOL_STADIUM.sky[0],
  build,
};
