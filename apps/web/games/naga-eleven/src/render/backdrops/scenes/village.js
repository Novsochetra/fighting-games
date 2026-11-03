import { glow } from '../dither.js';
import { paintStreak } from '../parts/clouds.js';
import { paintBanana, paintGrove } from '../parts/groves.js';
import { paintPaddies } from '../parts/paddies.js';
import { paintSugarPalm } from '../parts/palms.js';
import { paintBall, paintDirtPath, paintFence } from '../parts/path.js';
import { paintSky, paintStars, paintSun } from '../parts/sky.js';
import { paintStiltHouse } from '../parts/stilt-house.js';
import { paintHedge, paintTreeline } from '../parts/treeline.js';

// Chrey village, the same place at dawn and at dusk: the sun low over the paddies, the house on
// its posts, the sugar palms, the path home and the ball left by the fence
export const HORIZON = 104;

const FAR_PALMS = [
  { x: 28, base: 101, height: 18, crown: 4 },
  { x: 236, base: 102, height: 22, crown: 4 },
  { x: 318, base: 101, height: 16, crown: 3 },
  { x: 356, base: 102, height: 20, crown: 4 },
];

const NEAR_PALMS = [
  { x: 172, base: 112, height: 42, crown: 6, seed: 4 },
  { x: 268, base: 110, height: 34, crown: 5, seed: 5 },
  { x: 204, base: 134, height: 98, crown: 12, lean: 3, seed: 6 },
  { x: 36, base: 150, height: 120, crown: 14, lean: -4, seed: 7 },
  { x: 350, base: 146, height: 108, crown: 13, lean: 5, seed: 8 },
];

export const HOUSE = { x: 82, ground: 130, width: 76 };

const STREAKS = [
  [30, 34, 110, 7, 1],
  [170, 48, 130, 8, 2],
  [250, 76, 120, 5, 3],
  [10, 80, 150, 5, 4],
  [300, 24, 90, 5, 5],
  [120, 66, 60, 3, 6],
];

const silhouette = (colors, rim) => ({
  trunk: [colors[0], colors[2]],
  leaf: [colors[0], colors[1], rim],
  dead: [colors[1], colors[2]],
});

function paintSkyline(raster, { art, sunX, dawn }) {
  paintSky(raster, { colors: art.sky, bottom: HORIZON + 1 });

  if (dawn) {
    paintSun(raster, {
      x: sunX,
      y: HORIZON - 9,
      radius: 9,
      colors: art.sun,
      glowRadius: 76,
      squash: 0.5,
    });
  } else {
    paintStars(raster, { count: 60, bottom: 60, colors: art.stars, seed: 4 });
    glow(raster, { x: sunX, y: HORIZON + 8, radius: 150, colors: art.sun.glow, squash: 0.33 });
  }

  STREAKS.forEach(([x, y, width, thickness, seed]) => {
    paintStreak(raster, { x, y, width, thickness, colors: art.cloud, seed });
  });
  paintTreeline(raster, { horizon: HORIZON, height: 9, colors: art.haze, seed: 3 });
  FAR_PALMS.forEach((palm) =>
    paintSugarPalm(raster, { ...palm, colors: silhouette(art.haze, art.haze[1]) }),
  );
}

function paintGround(raster, art) {
  paintPaddies(raster, {
    horizon: HORIZON,
    bottom: raster.height,
    vanish: 188,
    rows: [HORIZON + 1, 107, 111, 116, 123, 132, 145, 163, 188],
    columns: [-200, 90, 330, 640],
    colors: { rice: art.rice, dike: art.earth.slice(0, 3), ripple: art.ripple },
    flooded: 0.55,
    mirror: 0.6,
    seed: 9,
  });
  paintHedge(raster, {
    left: 240,
    right: 384,
    ground: 112,
    height: 6,
    colors: art.hazeNear,
    seed: 2,
  });
  paintHedge(raster, {
    left: 0,
    right: 150,
    ground: 116,
    height: 5,
    colors: art.hazeNear,
    seed: 5,
  });
}

const houseColors = (art) => ({
  post: art.shadow[0],
  wall: art.shadow[1],
  board: art.shadow[2],
  roof: art.roof[0],
  roofLine: art.roof[1],
  rim: art.rim[0],
  window: art.window,
  lamp: art.lamp,
  jar: art.shadow[2],
});

const PATH_BENDS = [
  [164, 230, 216],
  [180, 206, 150],
  [186, 196, 122],
  [188, 191, 112],
];

function paintPlants(raster, { art, light }) {
  const leaves = [art.shadow[0], art.shadow[1], art.rim[0]];

  paintGrove(raster, {
    x: 30,
    ground: 126,
    width: 100,
    height: 44,
    colors: [art.shadow[1], art.shadow[2], art.rim[0]],
    seed: 4,
    light,
  });
  [
    [170, 130, 30, 2],
    [74, 131, 24, 5],
  ].forEach(([x, ground, height, seed]) => {
    paintBanana(raster, { x, ground, height, colors: leaves, seed });
  });
}

function paintNear(raster, { art, frame, light }) {
  const windows = [
    { at: 0.28, lit: true },
    { at: 0.7, lit: light < 0 },
  ];

  paintPlants(raster, { art, light });
  paintDirtPath(raster, { bends: PATH_BENDS, colors: art.path, seed: 3 });
  paintStiltHouse(raster, { ...HOUSE, colors: houseColors(art), light, windows });
  paintFence(raster, {
    near: { x: 240, y: 214, height: 30 },
    far: { x: 198, y: 122 },
    posts: 10,
    colors: art.bamboo,
  });
  NEAR_PALMS.forEach((palm) => {
    const sway = palm.crown > 10 ? frame : 0;

    paintSugarPalm(raster, { ...palm, light, sway, colors: silhouette(art.shadow, art.rim[1]) });
  });
  paintBall(raster, { x: 210, y: 139, radius: 4 }, art.ball);
}

export function paintVillage(raster, { art, frame, dawn }) {
  const sunX = dawn ? 252 : 70;

  paintSkyline(raster, { art, sunX, dawn });
  paintGround(raster, art);
  paintNear(raster, { art, frame, light: dawn ? 1 : -1 });
}
