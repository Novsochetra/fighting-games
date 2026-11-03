import { HOTEL_NIGHT_ART } from '../../../art/backdrops/city.js';
import { glow } from '../dither.js';
import { hash } from '../hash.js';
import { drawTwinkles } from '../parts/drift.js';
import { paintShirt } from '../parts/kit.js';
import { paintLit } from '../parts/light.js';
import { paintStars } from '../parts/sky.js';
import { artRect } from '../pen.js';
import { fillRect, hline, plot, vline } from '../raster.js';
import { polygon } from '../shapes.js';

// A hotel room far from home on the night before the match: someone else's city lit up beyond
// the glass, the bedside lamp, the red shirt with 10 on it laid out on the bed
const art = HOTEL_NIGHT_ART;
const WINDOW = { x: 92, y: 18, width: 212, height: 118 };
const LAMP = { x: 46, y: 104 };
const TOWERS = Array.from({ length: 16 }, (_, i) => ({
  x: WINDOW.x + i * 14 - 4 + Math.round(hash(i, 1) * 6),
  width: 10 + Math.round(hash(i, 2) * 6),
  height: 24 + Math.round(hash(i, 3) * (i === 8 ? 90 : 56)),
}));
const LIT = TOWERS.flatMap((tower, i) =>
  Array.from({ length: 6 }, (_, j) => ({
    x: tower.x + 2 + Math.floor(hash(i, j, 4) * (tower.width - 3)),
    y: WINDOW.y + WINDOW.height - 4 - Math.floor(hash(i, j, 5) * (tower.height - 6)),
  })),
);

function paintCity(raster) {
  const { x, y, width, height } = WINDOW;

  for (let row = y; row < y + height; row += 1) {
    hline(
      raster,
      { x, y: row, length: width },
      art.sky[Math.min(4, Math.floor(((row - y) / height) * 5))],
    );
  }

  paintStars(raster, {
    count: 14,
    top: y,
    bottom: y + 30,
    left: x,
    width,
    colors: [art.windows[2], art.windows[3]],
    seed: 7,
  });
  TOWERS.forEach((tower, i) => {
    const top = y + height - tower.height;

    fillRect(
      raster,
      { x: tower.x, y: top, width: tower.width, height: tower.height },
      art.towers[i % 3],
    );

    for (let floor = top + 3; floor < y + height; floor += 3) {
      for (let column = tower.x + 2; column < tower.x + tower.width - 1; column += 2) {
        plot(
          raster,
          column,
          floor,
          hash(column, floor) > 0.72
            ? art.windows[Math.floor(hash(column, floor, 2) * 4)]
            : art.towers[(i + 1) % 3],
        );
      }
    }
  });
}

function paintRoom(raster) {
  const light = { ...LAMP, radius: 420, squash: 1 };

  paintLit(raster, { rect: { x: 0, y: 0, width: 384, height: 216 }, ramp: art.room, light });
  paintCity(raster);
  fillRect(
    raster,
    { x: WINDOW.x - 4, y: WINDOW.y + WINDOW.height, width: WINDOW.width + 8, height: 4 },
    art.room[3],
  );
  [
    [WINDOW.x - 26, 30],
    [WINDOW.x + WINDOW.width - 4, 30],
  ].forEach(([left, width]) => {
    paintLit(raster, {
      rect: { x: left, y: 10, width, height: 136 },
      ramp: art.curtain,
      light: { ...light, radius: 400 },
      texture: (x) => ((x - left) % 6 < 2 ? -0.8 : 0.3),
    });
  });
  fillRect(raster, { x: WINDOW.x - 30, y: 8, width: WINDOW.width + 60, height: 3 }, art.room[2]);
}

function paintLamp(raster) {
  const { x, y } = LAMP;

  fillRect(raster, { x: 26, y: 124, width: 42, height: 30 }, art.room[3]);
  hline(raster, { x: 26, y: 124, length: 42 }, art.room[6]);
  glow(raster, { x, y, radius: 34, colors: [art.room[6], art.room[7], art.lamp[1]] });
  polygon(raster, [x - 7, y - 10, x + 7, y - 10, x + 10, y + 4, x - 10, y + 4], art.lamp[1]);
  hline(raster, { x: x - 9, y: y + 4, length: 19 }, art.lamp[0]);
  vline(raster, { x, y: y + 5, length: 14 }, art.room[5]);
  fillRect(raster, { x: x - 5, y: y + 18, width: 11, height: 2 }, art.room[5]);
}

const SHIRT = {
  shade: art.shirt[0],
  base: art.shirt[1],
  lit: art.shirt[1],
  trim: art.sheet[0],
  number: art.shirt[2],
};

function paintBed(raster) {
  const folds = (x, y) => ((x + y * 2) % 23 === 0 ? -1 : 0);

  paintLit(raster, {
    rect: { x: 84, y: 156, width: 300, height: 60 },
    ramp: art.sheet,
    light: { ...LAMP, radius: 300 },
    texture: folds,
  });
  fillRect(raster, { x: 84, y: 152, width: 300, height: 4 }, art.sheet[2]);
  paintShirt(raster, { x: 198, y: 158, number: 10, colors: SHIRT });
}

export const HOTEL_NIGHT = {
  paint: (raster) => {
    paintRoom(raster);
    paintLamp(raster);
    paintBed(raster);
  },
  overlay: (context, tick) => {
    drawTwinkles(context, {
      points: LIT.slice(0, 40),
      colors: [...art.windows, art.towers[1], art.towers[2]],
      tick,
      period: 40,
    });
    artRect(
      context,
      { x: TOWERS[8].x + 5, y: WINDOW.y + WINDOW.height - TOWERS[8].height - 2 },
      tick % 80 < 40 ? art.beacon : art.towers[0],
    );
  },
};
