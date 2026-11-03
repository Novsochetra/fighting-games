import { TEMPLE_DAWN_ART } from '../../../art/backdrops/temple.js';
import { paintStreak } from '../parts/clouds.js';
import { drawMotes } from '../parts/drift.js';
import { paintFigure } from '../parts/figures.js';
import { paintGrove } from '../parts/groves.js';
import { paintNagaHood, paintNagaRail, paintStairs } from '../parts/naga-stairs.js';
import { paintSugarPalm } from '../parts/palms.js';
import { paintPrang } from '../parts/prang.js';
import { paintSky, paintSun } from '../parts/sky.js';
import { fillRect, hline } from '../raster.js';

// The temple steps at dawn where Kampong Cham High trains: the stairs between their nagas, the
// gate tower gold on its sunward face, monks in orange crossing the top
const art = TEMPLE_DAWN_ART;
const STAIRS = { top: { y: 104, left: 168, right: 216 }, bottom: { y: 214, left: 96, right: 288 } };
const towerColors = [art.stone[2], art.stone[4], art.stone[6], art.stone[1]];

function paintSkyline(raster) {
  paintSky(raster, { colors: art.sky, bottom: 120 });
  paintSun(raster, { x: 44, y: 66, radius: 8, colors: art.sun, glowRadius: 90, squash: 0.75 });
  [
    [90, 30, 120, 5, 1],
    [250, 50, 110, 4, 2],
    [10, 92, 90, 3, 3],
  ].forEach(([x, y, width, thickness, seed]) => {
    paintStreak(raster, { x, y, width, thickness, colors: art.cloud, seed, litBelow: false });
  });
  paintGrove(raster, {
    x: -20,
    ground: 120,
    width: 140,
    height: 50,
    colors: [art.jungle[0], art.jungle[1], art.jungle[3]],
    seed: 6,
    light: -1,
  });
  paintGrove(raster, {
    x: 250,
    ground: 122,
    width: 150,
    height: 56,
    colors: [art.jungle[0], art.jungle[1], art.jungle[3]],
    seed: 8,
    light: -1,
  });
}

// the temple mountain's terraces either side of the stairs, laterite blocks lit along their lips
function paintTerraces(raster) {
  const levels = [104, 130, 156, 184, 216];

  levels.slice(1).forEach((bottom, i) => {
    const top = levels[i];
    const along = i / (levels.length - 1);
    const left = Math.round(134 - 120 * along);
    const right = Math.round(250 + 120 * along);

    fillRect(raster, { x: left, y: top, width: right - left, height: bottom - top }, art.stone[2]);
    fillRect(raster, { x: left, y: top, width: right - left, height: 3 }, art.stone[5]);
    hline(raster, { x: left, y: top + 3, length: right - left }, art.stone[3]);

    for (let row = top + 6; row < bottom; row += 5) {
      hline(raster, { x: left, y: row, length: right - left }, art.stone[1]);

      for (let x = left + ((row / 5) % 2) * 4; x < right; x += 9) {
        fillRect(raster, { x, y: row - 4, width: 1, height: 4 }, art.stone[1]);
      }
    }
  });
}

function paintGate(raster) {
  fillRect(raster, { x: 126, y: 86, width: 132, height: 20 }, art.stone[3]);
  hline(raster, { x: 126, y: 86, length: 132 }, art.stone[5]);

  for (let x = 128; x < 256; x += 8) {
    fillRect(raster, { x, y: 92, width: 3, height: 12 }, art.stone[1]);
  }

  paintPrang(raster, { x: 140, base: 92, width: 22, height: 34, colors: towerColors, light: -1 });
  paintPrang(raster, { x: 244, base: 92, width: 22, height: 34, colors: towerColors, light: -1 });
  paintPrang(raster, { x: 192, base: 98, width: 38, height: 66, colors: towerColors, light: -1 });
  fillRect(raster, { x: 184, y: 82, width: 16, height: 16 }, art.stone[0]);
  fillRect(raster, { x: 186, y: 84, width: 12, height: 14 }, art.stone[1]);
}

function paintMonks(raster) {
  [
    [176, 104, 13],
    [186, 103, 12],
    [210, 104, 13],
  ].forEach(([x, ground, height]) => {
    paintFigure(raster, {
      x,
      ground,
      height,
      pose: 'robe',
      colors: art.robe,
      toward: { x: -1, y: 0 },
    });
  });
}

function paintTemple(raster) {
  paintSkyline(raster);
  fillRect(raster, { x: 0, y: 120, width: 384, height: 96 }, art.grass[0]);
  paintTerraces(raster);
  paintGate(raster);
  paintStairs(raster, { stairs: STAIRS, colors: art });
  paintMonks(raster);
  paintNagaRail(raster, { stairs: STAIRS, side: -1, colors: art });
  paintNagaRail(raster, { stairs: STAIRS, side: 1, colors: art });
  [
    [124, 158],
    [260, 158],
    [92, 212],
    [292, 212],
  ].forEach(([x, y]) => paintNagaHood(raster, { x, y, colors: art }));
  [
    [30, 160, 130, 15, 4],
    [356, 170, 140, 16, 5],
  ].forEach(([x, base, height, crown, seed]) => {
    const colors = {
      trunk: [art.jungle[0], art.jungle[3]],
      leaf: [art.jungle[0], art.jungle[1], art.jungle[3]],
      dead: [art.jungle[1], art.jungle[2]],
    };

    paintSugarPalm(raster, { x, base, height, crown, colors, light: -1, seed });
  });
}

export const TEMPLE_DAWN = {
  paint: paintTemple,
  overlay: (context, tick) =>
    drawMotes(context, {
      area: { x: 0, y: 40, width: 384, height: 120 },
      count: 18,
      colors: art.mote,
      tick,
    }),
};
