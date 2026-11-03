import { HIGH_SCHOOL_ART } from '../../../art/backdrops/school.js';
import { paintBikeRack } from '../parts/bikes.js';
import { paintCumulus } from '../parts/clouds.js';
import { paintGrove, paintTree } from '../parts/groves.js';
import { paintSugarPalm } from '../parts/palms.js';
import { paintNet, paintYard } from '../parts/pitch-props.js';
import { paintSchoolhouse } from '../parts/schoolhouse.js';
import { paintSky } from '../parts/sky.js';
import { paintTreeline } from '../parts/treeline.js';
import { fillRect, hline } from '../raster.js';

// Kampong Cham High in the late afternoon: the long two-storey block, a dusty pitch worn bare
// in the goalmouths, the bikes the boys ride in from the villages
const art = HIGH_SCHOOL_ART;
const HORIZON = 98;
const greens = [art.green[1], art.green[2], art.green[3]];
const palm = {
  trunk: [art.earth[0], art.earth[1]],
  leaf: [art.green[0], art.green[1], art.green[3]],
  dead: [art.earth[1], art.earth[2]],
};

function paintSkyline(raster) {
  paintSky(raster, { colors: art.sky, bottom: HORIZON + 1 });
  [
    [90, 34, 80, 12, 4],
    [240, 22, 100, 14, 6],
    [330, 50, 50, 9, 7],
  ].forEach(([x, y, width, height, seed]) => {
    paintCumulus(raster, { x, y, width, height, colors: art.cloud, seed });
  });
  paintTreeline(raster, { horizon: HORIZON, height: 12, colors: art.haze, seed: 11 });
  paintGrove(raster, {
    x: -10,
    ground: 112,
    width: 80,
    height: 40,
    colors: greens,
    seed: 7,
    light: -1,
  });
  [
    [40, 106, 70, 9, 2],
    [344, 108, 80, 10, 3],
  ].forEach(([x, base, height, crown, seed]) => {
    paintSugarPalm(raster, { x, base, height, crown, colors: palm, light: -1, seed });
  });
}

function paintGoal(raster, { x, ground, width, height }) {
  paintNet(raster, {
    x: x + 2,
    y: ground - height - 3,
    width: width - 4,
    height: height + 2,
    color: art.metal[2],
  });
  [x, x + width - 2].forEach((postX) =>
    fillRect(raster, { x: postX, y: ground - height, width: 2, height }, art.metal[3]),
  );
  hline(raster, { x, y: ground - height, length: width }, art.metal[3]);
  hline(raster, { x, y: ground - height + 1, length: width }, art.metal[1]);
}

function paintPitch(raster) {
  paintYard(raster, {
    top: HORIZON + 1,
    bottom: raster.height,
    colors: { earth: art.earth, green: art.green },
    seed: 13,
    bare: 0.55,
  });

  paintGoal(raster, { x: 150, ground: 129, width: 52, height: 16 });
}

export const HIGH_SCHOOL = {
  paint: (raster) => {
    paintSkyline(raster);
    paintPitch(raster);
    paintSchoolhouse(raster, { x: 72, ground: 116, width: 248, storeys: 2, bay: 20, colors: art });
    paintBikeRack(raster, {
      x: 254,
      ground: 150,
      count: 6,
      colors: { metal: art.metal, frames: art.bikes.slice(1) },
    });
    paintTree(raster, { x: 356, ground: 150, height: 88, colors: greens, seed: 4, light: -1 });
  },
};
