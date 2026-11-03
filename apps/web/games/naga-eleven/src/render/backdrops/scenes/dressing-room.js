import { DRESSING_ART } from '../../../art/backdrops/football.js';
import { hash } from '../hash.js';
import { paintShirt } from '../parts/kit.js';
import { paintLit } from '../parts/light.js';
import { paintBall } from '../parts/path.js';
import { tiles } from '../parts/textures.js';
import { artRect } from '../pen.js';
import { fillRect, hline, plot, vline } from '../raster.js';
import { disc } from '../shapes.js';
import { paintTacticsBoard } from './tactics-board.js';

// The dressing room before a match: open wooden lockers with the red shirts on their hooks, the
// coach's board in the middle, the bench, the tubes of light overhead
const art = DRESSING_ART;
const LIGHT = { x: 192, y: -30, radius: 320, squash: 1.4 };
const NUMBERS = [1, 4, 5, 6, 8, 10, 7, 9, 11, 3];
const CLOCK = { x: 192, y: 15 };
const TUBES = [
  { x: 70, y: 3, width: 60, height: 2 },
  { x: 254, y: 3, width: 60, height: 2 },
];
const shirtColors = {
  shade: art.kit[0],
  base: art.kit[1],
  lit: art.kit[2],
  trim: art.kit[3],
  number: art.kit[4],
};

function paintLocker(raster, { x, number }) {
  paintLit(raster, {
    rect: { x, y: 34, width: 34, height: 100 },
    ramp: art.wood.slice(0, 3),
    light: { ...LIGHT, y: 60, radius: 120 },
    texture: (px) => (px % 11 === 0 ? -1 : 0),
  });
  fillRect(raster, { x, y: 34, width: 2, height: 100 }, art.wood[4]);
  fillRect(raster, { x, y: 34, width: 34, height: 3 }, art.wood[4]);
  fillRect(raster, { x: x + 2, y: 52, width: 32, height: 2 }, art.wood[3]);
  fillRect(raster, { x: x + 8, y: 38, width: 18, height: 4 }, art.towel[0]);
  hline(raster, { x: x + 9, y: 40, length: 16 }, art.kit[3]);

  if (hash(number, 3) > 0.4) {
    fillRect(raster, { x: x + 6, y: 46, width: 12, height: 6 }, art.locker[1]);
    hline(raster, { x: x + 6, y: 46, length: 12 }, art.locker[3]);
  }

  paintShirt(raster, { x: x + 17, y: 62, number, colors: shirtColors });
}

function paintBench(raster) {
  fillRect(raster, { x: 8, y: 132, width: 368, height: 6 }, art.wood[3]);
  hline(raster, { x: 8, y: 132, length: 368 }, art.wood[4]);
  hline(raster, { x: 8, y: 137, length: 368 }, art.wood[1]);

  for (let leg = 20; leg < 376; leg += 60) {
    fillRect(raster, { x: leg, y: 138, width: 4, height: 14 }, art.wood[1]);
  }

  paintBall(raster, { x: 150, y: 128, radius: 4 }, art.ball);
  fillRect(raster, { x: 250, y: 127, width: 20, height: 5 }, art.towel[0]);
  hline(raster, { x: 250, y: 131, length: 20 }, art.towel[1]);
  [
    [80, 2],
    [88, 3],
  ].forEach(([x]) => {
    fillRect(raster, { x, y: 128, width: 7, height: 4 }, art.tile[0]);
    hline(raster, { x, y: 131, length: 8 }, art.kit[4]);
  });
}

function paintRoom(raster) {
  paintLit(raster, {
    rect: { x: 0, y: 0, width: 384, height: 152 },
    ramp: art.tile,
    light: LIGHT,
    texture: tiles(8),
  });
  paintLit(raster, {
    rect: { x: 0, y: 152, width: 384, height: 64 },
    ramp: art.floor,
    light: { x: 192, y: 150, radius: 260, squash: 3 },
    texture: tiles(12),
  });
  [0, 1, 2, 3].forEach((slot) => paintLocker(raster, { x: 8 + slot * 34, number: NUMBERS[slot] }));
  [0, 1, 2, 3].forEach((slot) =>
    paintLocker(raster, { x: 240 + slot * 34, number: NUMBERS[slot + 4] }),
  );
  paintTacticsBoard(raster, { x: 150, y: 30, width: 84, height: 62, colors: art.board });
  paintBench(raster);
  TUBES.forEach((tube) =>
    fillRect(raster, { ...tube, y: tube.y - 1, height: tube.height + 2 }, art.tile[1]),
  );
  vline(raster, { x: 192, y: 92, length: 40 }, art.board[4]);
  disc(raster, { ...CLOCK, radius: 7 }, art.board[4]);
  disc(raster, { ...CLOCK, radius: 6 }, art.board[1]);
  [0, 3, 6, 9].forEach((hour) => {
    const turn = (hour / 12) * Math.PI * 2;

    plot(
      raster,
      CLOCK.x + Math.round(Math.sin(turn) * 5),
      CLOCK.y - Math.round(Math.cos(turn) * 5),
      art.board[4],
    );
  });
  vline(raster, { x: CLOCK.x, y: CLOCK.y - 3, length: 3 }, art.board[4]);
  hline(raster, { x: CLOCK.x, y: CLOCK.y, length: 3 }, art.board[4]);
}

// one tube flickers now and then, as old tubes do, and the clock counts down to kick-off
function drawTubesAndClock(context, tick) {
  const second = Math.floor(tick / 60) % 60;
  const turn = (second / 60) * Math.PI * 2;

  TUBES.forEach((tube, i) => {
    const flicker = i === 1 && hash(Math.floor(tick / 4), 9) > 0.93;

    artRect(context, tube, art.light[flicker ? 0 : 1]);
  });

  for (let reach = 1; reach <= 4; reach += 1) {
    artRect(
      context,
      {
        x: CLOCK.x + Math.round(Math.sin(turn) * reach),
        y: CLOCK.y - Math.round(Math.cos(turn) * reach),
      },
      art.kit[1],
    );
  }
}

export const DRESSING_ROOM = { paint: paintRoom, overlay: drawTubesAndClock };
