import { ANGKOR_SUNRISE_ART } from '../../../art/backdrops/temple.js';
import { paintAngkorWat } from '../parts/angkor.js';
import { paintStreak } from '../parts/clouds.js';
import { paintFigure } from '../parts/figures.js';
import { paintLotusFlower, paintLotusLeaf } from '../parts/lotus.js';
import { paintSugarPalm } from '../parts/palms.js';
import { paintSky, paintStars, paintSun } from '../parts/sky.js';
import { paintTreeline } from '../parts/treeline.js';
import { glitterDashes, paintReflection } from '../parts/water.js';
import { artRect } from '../pen.js';
import { fillRect, hline } from '../raster.js';

// The epilogue: the sun coming up behind the five towers of Angkor Wat, the sky on fire and the
// moat holding all of it, lotus at our feet, palms standing either side as they have for
// nine hundred years
const art = ANGKOR_SUNRISE_ART;
const BANK = 122;
const SUN = { x: 206, y: 82 };
const STREAKS = [
  [18, 26, 120, 5, 1],
  [230, 20, 140, 6, 2],
  [90, 46, 150, 6, 3],
  [270, 56, 100, 4, 4],
  [0, 70, 110, 4, 5],
  [150, 64, 70, 3, 6],
  [300, 88, 90, 3, 7],
];
const PALMS = [
  { x: 22, base: 128, height: 112, crown: 15, lean: 3, seed: 2 },
  { x: 54, base: 124, height: 84, crown: 12, lean: -2, seed: 3 },
  { x: 334, base: 126, height: 100, crown: 14, lean: -4, seed: 4 },
  { x: 364, base: 128, height: 120, crown: 16, lean: 2, seed: 5 },
];

function paintHeavens(raster, frame) {
  paintSky(raster, { colors: art.sky, bottom: BANK + 1, edge: 0.5 });
  paintStars(raster, { count: 30, bottom: 34, colors: art.stars, seed: 9 });
  paintSun(raster, {
    ...SUN,
    radius: 12,
    colors: art.sun,
    glowRadius: 118 + frame * 5,
    squash: 0.6,
  });
  STREAKS.forEach(([x, y, width, thickness, seed]) =>
    paintStreak(raster, { x, y, width, thickness, colors: art.cloud, seed }),
  );
}

const PEOPLE = [
  [120, 10, 'robe'],
  [126, 9, 'child'],
  [262, 10, 'robe'],
];

function paintShore(raster) {
  const jungle = [art.jungle[2], art.jungle[3]];
  const toward = { x: 1, y: 0 };

  [
    [31, 0, 90],
    [32, 294, 384],
  ].forEach(([seed, from, to]) => {
    paintTreeline(raster, { horizon: BANK - 4, height: 10, colors: jungle, seed, from, to });
  });
  fillRect(raster, { x: 0, y: BANK - 3, width: 384, height: 4 }, art.jungle[1]);
  hline(raster, { x: 0, y: BANK - 3, length: 384 }, art.jungle[2]);
  PEOPLE.forEach(([x, height, pose]) => {
    paintFigure(raster, {
      x,
      ground: BANK - 2,
      height,
      pose,
      colors: [art.jungle[0], art.jungle[3]],
      toward,
    });
  });
}

function paintTemple(raster) {
  const silhouette = [art.temple[1], art.temple[2], art.temple[3], art.temple[0]];
  const palmColors = {
    trunk: [art.jungle[0], art.jungle[2]],
    leaf: [art.jungle[0], art.jungle[1], art.jungle[2]],
    dead: [art.jungle[1], art.jungle[2]],
  };

  paintAngkorWat(raster, { x: 192, base: BANK - 3, colors: silhouette, light: 1 });
  paintShore(raster);
  PALMS.forEach((palm) => paintSugarPalm(raster, { ...palm, colors: palmColors }));
}

function paintMoat(raster) {
  paintReflection(raster, { line: BANK, colors: art.water, seed: 4 });
  [
    [40, 170, 12],
    [74, 186, 9],
    [18, 200, 14],
    [330, 176, 11],
    [360, 196, 15],
    [300, 204, 10],
    [120, 208, 8],
  ].forEach(([x, y, size]) => {
    paintLotusLeaf(raster, { x, y, size, colors: art.lotus });
  });
  [
    [48, 168, 10],
    [66, 184, 7],
    [342, 174, 9],
    [312, 202, 8],
  ].forEach(([x, y, height]) => {
    paintLotusFlower(raster, { x, y, height, colors: art.lotus });
  });
}

function drawBirds(context, tick) {
  for (let i = 0; i < 4; i += 1) {
    const x = ((60 + i * 30 + tick * (0.12 + i * 0.02)) % 440) - 30;
    const y = 40 + i * 6 + Math.round(Math.sin(tick / 30 + i) * 2);
    const wing = Math.floor(tick / 12 + i) % 2;

    artRect(context, { x, y }, art.birds);
    artRect(context, { x: x - 1, y: y - wing }, art.birds);
    artRect(context, { x: x + 1, y: y - wing }, art.birds);
  }
}

export const ANGKOR_SUNRISE = {
  frameOf: (tick) => [0, 1, 2, 1][Math.floor(tick / 40) % 4],
  paint: (raster, frame) => {
    paintHeavens(raster, frame);
    paintTemple(raster);
    paintMoat(raster);
  },
  overlay: (context, tick) => {
    glitterDashes({ x: SUN.x, line: BANK, bottom: 216, tick }).forEach((dash) => {
      artRect(
        context,
        { x: dash.x, y: dash.y, width: dash.width, height: 1 },
        art.glint[dash.tone],
      );
    });
    drawBirds(context, tick);
  },
};
