import { VILLAGE_TV_ART } from '../../../art/backdrops/village-tv.js';
import { hash } from '../hash.js';
import { paintFigure } from '../parts/figures.js';
import { paintLit } from '../parts/light.js';
import { paintSugarPalm } from '../parts/palms.js';
import { paintStars } from '../parts/sky.js';
import { artRect } from '../pen.js';
import { fillRect, hline } from '../raster.js';
import { line } from '../shapes.js';
import { CROWD, drawScreen, SCREEN } from './village-tv-screen.js';

// The World Championship final, as Chrey watched it: the whole village under one house on its
// posts, packed round one small TV, its light flickering on every face
const art = VILLAGE_TV_ART;
const TV = { x: 192, y: 102 };

function paintNight(raster) {
  for (let y = 0; y < 120; y += 1) {
    hline(raster, { x: 0, y, length: 384 }, art.night[Math.min(3, Math.floor(y / 32))]);
  }

  paintStars(raster, { count: 70, bottom: 100, colors: art.stars, seed: 12 });
  [
    [60, 118, 70, 10, 1],
    [150, 120, 84, 11, 2],
    [310, 118, 76, 10, 3],
  ].forEach(([x, base, height, crown, seed]) => {
    paintSugarPalm(raster, {
      x,
      base,
      height,
      crown,
      colors: { trunk: art.palm, leaf: [art.palm[0], art.palm[0], art.palm[1]], dead: art.palm },
      seed,
    });
  });
}

function paintHouse(raster, light) {
  paintLit(raster, {
    rect: { x: 0, y: 0, width: 384, height: 30 },
    ramp: art.under,
    light,
    texture: (x) => (x % 24 < 3 ? 1 : 0),
  });
  paintLit(raster, {
    rect: { x: 0, y: 120, width: 384, height: 96 },
    ramp: art.under,
    light: { ...light, squash: 2.2 },
    texture: (x, y) => (hash(x, y) > 0.9 ? -1 : 0),
  });
  [36, 120, 264, 348].forEach((x) => {
    paintLit(raster, {
      rect: { x, y: 30, width: 6, height: 104 },
      ramp: art.under,
      light,
      texture: (px) => (px === x ? -1 : 0),
    });
  });
}

function paintTv(raster) {
  fillRect(raster, { x: TV.x - 24, y: TV.y + 14, width: 48, height: 3 }, art.casing[1]);
  [TV.x - 22, TV.x + 20].forEach((legX) =>
    fillRect(raster, { x: legX, y: TV.y + 17, width: 2, height: 14 }, art.casing[0]),
  );
  fillRect(
    raster,
    { x: SCREEN.x - 3, y: SCREEN.y - 3, width: SCREEN.width + 6, height: SCREEN.height + 6 },
    art.casing[1],
  );
  hline(raster, { x: SCREEN.x - 3, y: SCREEN.y - 3, length: SCREEN.width + 6 }, art.casing[2]);
  line(
    raster,
    { from: { x: TV.x - 2, y: SCREEN.y - 3 }, to: { x: TV.x - 10, y: SCREEN.y - 16 } },
    art.casing[2],
  );
  line(
    raster,
    { from: { x: TV.x + 2, y: SCREEN.y - 3 }, to: { x: TV.x + 9, y: SCREEN.y - 15 } },
    art.casing[2],
  );
}

function paintCrowd(raster, frame) {
  const rim = art.glow[[1, 2, 0][frame]];

  CROWD.forEach(({ x, ground, height, pose }) => {
    const toward = { x: Math.sign(TV.x - x), y: 0 };
    const near = Math.abs(x - TV.x) < 110 && ground < 200;

    paintFigure(raster, {
      x,
      ground,
      height,
      pose,
      build: 1.4,
      colors: [art.people, near ? rim : art.glow[0]],
      toward,
    });
  });
}

function paintVillageTv(raster, frame) {
  const light = { x: TV.x, y: TV.y, radius: [210, 240, 180][frame], squash: 1 };

  paintNight(raster);
  paintHouse(raster, light);
  paintTv(raster);
  paintCrowd(raster, frame);
}

export const VILLAGE_TV = {
  frameOf: (tick) => Math.floor(hash(Math.floor(tick / 8), 4) * 3),
  paint: paintVillageTv,
  overlay: (context, tick) => {
    drawScreen(context, { colors: art.screen, tick });
    artRect(context, { x: TV.x + 14, y: TV.y + 12, width: 1, height: 1 }, art.screen[3]);
  },
};
