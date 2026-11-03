import { SCHOOL_YARD_ART } from '../../../art/backdrops/school.js';
import { paintCumulus } from '../parts/clouds.js';
import { paintDressed } from '../parts/figures.js';
import { paintGrove, paintTree } from '../parts/groves.js';
import { paintSugarPalm } from '../parts/palms.js';
import { paintBall } from '../parts/path.js';
import { drawFlag, paintBambooGoal, paintFlagpole, paintYard } from '../parts/pitch-props.js';
import { paintNameBoard, paintSchoolhouse } from '../parts/schoolhouse.js';
import { paintSky } from '../parts/sky.js';
import { paintTreeline } from '../parts/treeline.js';

// Chrey School on a clear morning: one long ochre building, the flag, the bamboo goals on the
// red earth where Coach Vannak first saw the gift
const art = SCHOOL_YARD_ART;
const HORIZON = 100;
const FLAG = { x: 64, y: 50 };
const leafy = {
  trunk: [art.earth[0], art.earth[1]],
  leaf: [art.green[0], art.green[1], art.green[3]],
  dead: [art.earth[1], art.earth[2]],
};

function paintBackdrop(raster) {
  paintSky(raster, { colors: art.sky, bottom: HORIZON + 1 });
  [
    [30, 40, 60, 12, 1],
    [150, 26, 90, 15, 2],
    [290, 46, 70, 11, 3],
  ].forEach(([x, y, width, height, seed]) => {
    paintCumulus(raster, { x, y, width, height, colors: art.cloud, seed });
  });
  paintTreeline(raster, { horizon: HORIZON, height: 10, colors: art.haze, seed: 8 });
  paintGrove(raster, {
    x: 0,
    ground: 112,
    width: 110,
    height: 34,
    colors: [art.green[1], art.green[2], art.green[3]],
    seed: 3,
    light: -1,
  });
  paintGrove(raster, {
    x: 290,
    ground: 112,
    width: 100,
    height: 30,
    colors: [art.green[1], art.green[2], art.green[3]],
    seed: 5,
    light: -1,
  });
  [
    [118, 108, 66, 9, 1],
    [282, 108, 74, 10, 2],
    [210, 104, 50, 7, 3],
  ].forEach(([x, base, height, crown, seed]) => {
    paintSugarPalm(raster, { x, base, height, crown, colors: leafy, light: -1, seed });
  });
}

function paintSchool(raster) {
  const colors = {
    wall: art.wall,
    trim: art.trim,
    door: art.door,
    roof: art.roof,
    shadow: art.shadow,
  };

  paintYard(raster, {
    top: HORIZON + 1,
    bottom: raster.height,
    colors: { earth: art.earth, green: art.green },
    seed: 4,
  });
  paintSchoolhouse(raster, { x: 104, ground: 122, width: 196, bay: 22, colors });
  paintNameBoard(raster, { x: 176, y: 91, width: 48, colors });
  paintFlagpole(raster, { x: FLAG.x - 1, ground: 132, height: 84, colors: art.trim });
  paintBambooGoal(raster, { x: 300, ground: 146, width: 44, height: 18, colors: art.bamboo });
  paintBambooGoal(raster, { x: 30, ground: 140, width: 30, height: 13, colors: art.bamboo });
  paintTree(raster, {
    x: 368,
    ground: 150,
    height: 92,
    colors: [art.green[1], art.green[2], art.green[3]],
    seed: 9,
    light: -1,
  });
}

function paintKids(raster) {
  [
    [232, 140, 21],
    [262, 145, 22],
    [318, 144, 20],
    [184, 137, 19],
    [150, 141, 20],
  ].forEach(([x, ground, height]) => {
    paintDressed(raster, { x, ground, height, colors: art.kids });
  });
  paintBall(raster, { x: 247, y: 144, radius: 2 }, art.ball);
}

export const SCHOOL_YARD = {
  paint: (raster) => {
    paintBackdrop(raster);
    paintSchool(raster);
    paintKids(raster);
  },
  overlay: (context, tick) => drawFlag(context, { ...FLAG, colors: art.flag, tick }),
};
