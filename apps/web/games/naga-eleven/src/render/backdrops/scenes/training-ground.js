import { TRAINING_ART } from '../../../art/backdrops/football.js';
import { mixes } from '../dither.js';
import { hash } from '../hash.js';
import { paintCumulus } from '../parts/clouds.js';
import { paintGrove } from '../parts/groves.js';
import { paintBall } from '../parts/path.js';
import { paintNet } from '../parts/pitch-props.js';
import { paintSky } from '../parts/sky.js';
import { paintCone, paintDugout, paintMast } from '../parts/training-props.js';
import { paintTreeline } from '../parts/treeline.js';
import { artRect } from '../pen.js';
import { fillRect, hline, plot, vline } from '../raster.js';
import { ellipse } from '../shapes.js';

// The training pitch in the late afternoon: cones set out for the drill, the goal and its net,
// the covered bench, the floodlight masts not yet lit
const art = TRAINING_ART;
const HORIZON = 98;
const STRIPES = [112, 116, 121, 127, 134, 143, 154, 168, 186, 216];
const CONES = [
  [118, 140],
  [138, 134],
  [158, 140],
  [178, 134],
  [198, 140],
  [218, 134],
  [238, 140],
];
const CORNER = { x: 372, y: 104 };

function paintBackground(raster) {
  paintSky(raster, { colors: art.sky, bottom: HORIZON + 1 });
  [
    [40, 30, 90, 13, 1],
    [210, 20, 120, 16, 2],
    [320, 56, 50, 9, 3],
  ].forEach(([x, y, width, height, seed]) => {
    paintCumulus(raster, { x, y, width, height, colors: art.cloud, seed });
  });
  paintTreeline(raster, { horizon: HORIZON + 2, height: 14, colors: art.far, seed: 21 });
  fillRect(raster, { x: 150, y: 84, width: 92, height: 16 }, art.far[1]);
  hline(raster, { x: 148, y: 84, length: 96 }, art.line[0]);

  for (let x = 154; x < 238; x += 8) {
    fillRect(raster, { x, y: 89, width: 5, height: 4 }, art.far[0]);
  }

  paintGrove(raster, {
    x: -10,
    ground: 104,
    width: 120,
    height: 30,
    colors: art.trees,
    seed: 2,
    light: -1,
  });
  paintGrove(raster, {
    x: 270,
    ground: 104,
    width: 130,
    height: 34,
    colors: art.trees,
    seed: 4,
    light: -1,
  });
}

function paintFence(raster) {
  fillRect(raster, { x: 0, y: HORIZON, width: 384, height: 14 }, art.trees[0]);
  fillRect(raster, { x: 0, y: 104, width: 384, height: 8 }, art.cloth[0]);
  hline(raster, { x: 0, y: 104, length: 384 }, art.cloth[1]);

  for (let y = 90; y < 104; y += 1) {
    for (let x = 0; x < 384; x += 1) {
      if ((x + y) % 4 === 0 || (x - y + 400) % 4 === 0) {
        plot(raster, x, y, art.fence[mixes(x, y, 0.5) ? 1 : 0]);
      }
    }
  }

  for (let x = 6; x < 384; x += 32) {
    vline(raster, { x, y: 88, length: 24 }, art.fence[1]);
  }
}

function paintPitch(raster) {
  STRIPES.slice(1).forEach((bottom, i) => {
    for (let y = STRIPES[i]; y < bottom; y += 1) {
      for (let x = 0; x < 384; x += 1) {
        const speck = hash(x, y, 5) > 0.9;

        plot(raster, x, y, art.grass[speck ? (i % 2) * 3 : 1 + (i % 2)]);
      }
    }
  });
  hline(raster, { x: 0, y: 116, length: 384 }, art.line[1]);
  vline(raster, { x: 192, y: 116, length: 100 }, art.line[0]);
  ellipse(raster, { x: 192, y: 150, radiusX: 46, radiusY: 15 }, art.line[0]);
  ellipse(raster, { x: 192, y: 150, radiusX: 44, radiusY: 13 }, art.grass[2]);
  vline(raster, { x: 192, y: 137, length: 26 }, art.line[0]);
}

function paintGear(raster) {
  paintNet(raster, { x: 22, y: 98, width: 56, height: 24, color: art.line[0] });
  [20, 78].forEach((post) =>
    fillRect(raster, { x: post, y: 100, width: 2, height: 24 }, art.line[1]),
  );
  fillRect(raster, { x: 20, y: 100, width: 60, height: 2 }, art.line[1]);
  paintDugout(raster, {
    x: 296,
    ground: 124,
    width: 66,
    colors: { shell: art.metal, seat: art.bench },
  });
  [
    [12, 120, 108],
    [366, 120, 104],
  ].forEach(([x, ground, height]) => paintMast(raster, { x, ground, height, colors: art.metal }));
  CONES.forEach(([x, ground]) =>
    paintCone(raster, { x, ground, height: 9, colors: art.cone, shadow: art.shadow }),
  );
  [
    [266, 138],
    [270, 141],
    [262, 141],
    [266, 143],
  ].forEach(([x, y]) => paintBall(raster, { x, y, radius: 2 }, art.ball));
  [
    [98, 144],
    [306, 136],
  ].forEach(([x, y]) => paintBall(raster, { x, y, radius: 2 }, art.ball));
  [
    [340, 126],
    [344, 126],
  ].forEach(([x, y]) => {
    fillRect(raster, { x, y: y - 6, width: 2, height: 6 }, art.bottle[0]);
    plot(raster, x, y - 6, art.bottle[1]);
  });
}

function drawCornerFlag(context, tick) {
  artRect(context, { x: CORNER.x, y: CORNER.y, width: 1, height: 13 }, art.line[1]);

  for (let row = 0; row < 5; row += 1) {
    const wave = Math.round(Math.sin(tick * 0.15 + row * 0.6));

    artRect(
      context,
      { x: CORNER.x + 1, y: CORNER.y + row + wave * (row > 2 ? 1 : 0), width: 6 - row, height: 1 },
      art.cone[row % 2 ? 1 : 2],
    );
  }
}

export const TRAINING_GROUND = {
  paint: (raster) => {
    paintBackground(raster);
    paintFence(raster);
    paintPitch(raster);
    paintGear(raster);
  },
  overlay: drawCornerFlag,
};
