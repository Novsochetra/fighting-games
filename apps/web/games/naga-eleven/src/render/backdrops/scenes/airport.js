import { AIRPORT_ART } from '../../../art/backdrops/city.js';
import { hash } from '../hash.js';
import { paintCumulus } from '../parts/clouds.js';
import { paintLit } from '../parts/light.js';
import { paintPlane } from '../parts/plane.js';
import { artRect } from '../pen.js';
import { fillRect, hline, vline } from '../raster.js';

// The airport the night before the team flies: the glass wall, a plane at its stand, the board
// of departures clicking over, a row of seats
const art = AIRPORT_ART;
const HORIZON = 106;
const BOARD = { x: 18, y: 16, width: 112, height: 46 };
const ROWS = 6;
// the plane stands between the two portraits (x 20-84 and 300-364), so no speaker wears its tail
const PLANE = { x: 102, y: 110, length: 188 };

function paintOutside(raster) {
  for (let y = 0; y < HORIZON; y += 1) {
    hline(raster, { x: 0, y, length: 384 }, art.sky[Math.min(4, Math.floor((y / HORIZON) * 5))]);
  }

  paintCumulus(raster, {
    x: 200,
    y: 40,
    width: 80,
    height: 12,
    colors: [art.sky[3], art.sky[4], art.plane[2], art.plane[3]],
    seed: 5,
  });
  fillRect(raster, { x: 0, y: HORIZON - 3, width: 384, height: 3 }, art.grass[0]);
  fillRect(raster, { x: 0, y: HORIZON, width: 384, height: 46 }, art.tarmac[1]);

  for (let x = 0; x < 384; x += 24) {
    hline(raster, { x, y: 128, length: 12 }, art.board[2]);
  }

  paintPlane(raster, { ...PLANE, colors: { body: art.plane, stripe: art.stripe } });
}

function paintGlassWall(raster) {
  for (let x = 0; x <= 384; x += 64) {
    fillRect(raster, { x: x - 2, y: 0, width: 5, height: 152 }, art.frame[1]);
    vline(raster, { x: x - 2, y: 0, length: 152 }, art.frame[2]);
  }

  [8, 72].forEach((y) => fillRect(raster, { x: 0, y, width: 384, height: 3 }, art.frame[1]));
  fillRect(raster, { x: 0, y: 0, width: 384, height: 8 }, art.frame[0]);
  fillRect(raster, { x: 0, y: 148, width: 384, height: 4 }, art.frame[2]);
}

function paintBoard(raster) {
  [BOARD.x + 20, BOARD.x + BOARD.width - 20].forEach((x) =>
    vline(raster, { x, y: 8, length: BOARD.y - 8 }, art.frame[2]),
  );
  fillRect(
    raster,
    { ...BOARD, x: BOARD.x - 2, y: BOARD.y - 2, width: BOARD.width + 4, height: BOARD.height + 4 },
    art.frame[2],
  );
  fillRect(raster, BOARD, art.board[0]);
}

function paintHall(raster) {
  paintLit(raster, {
    rect: { x: 0, y: 152, width: 384, height: 64 },
    ramp: art.floor,
    light: { x: 192, y: 140, radius: 300, squash: 2.5 },
    texture: (x) => (x % 64 < 8 ? 1 : 0),
  });

  for (let seat = 40; seat < 360; seat += 20) {
    fillRect(raster, { x: seat, y: 140, width: 16, height: 9 }, art.seat[1]);
    hline(raster, { x: seat, y: 140, length: 16 }, art.seat[0]);
    fillRect(raster, { x: seat, y: 149, width: 16, height: 3 }, art.seat[0]);
  }

  fillRect(raster, { x: 36, y: 152, width: 328, height: 2 }, art.frame[2]);
  [60, 200, 340].forEach((leg) =>
    fillRect(raster, { x: leg, y: 154, width: 3, height: 10 }, art.frame[2]),
  );
}

// the board's rows of letters flip one at a time
function drawDepartures(context, tick) {
  for (let row = 0; row < ROWS; row += 1) {
    const flipping = Math.floor(tick / 6) % (ROWS * 4) === row;

    for (let cell = 0; cell < 13; cell += 1) {
      const lit = hash(row, cell, flipping ? tick : 0) > 0.25;
      const tone = cell < 4 ? 3 : 2;

      artRect(
        context,
        { x: BOARD.x + 4 + cell * 8, y: BOARD.y + 4 + row * 7, width: 6, height: 4 },
        art.board[lit ? tone : 1],
      );
    }
  }
}

export const AIRPORT = {
  paint: (raster) => {
    paintOutside(raster);
    paintGlassWall(raster);
    paintBoard(raster);
    paintHall(raster);
  },
  overlay: drawDepartures,
};
