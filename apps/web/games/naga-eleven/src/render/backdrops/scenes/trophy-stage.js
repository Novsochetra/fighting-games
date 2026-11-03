import { TROPHY_ART } from '../../../art/backdrops/football.js';
import { glow, mixes } from '../dither.js';
import { hash } from '../hash.js';
import { paintTrophy } from '../parts/trophy.js';
import { artRect } from '../pen.js';
import { fillRect, hline, plot } from '../raster.js';

// The trophy on its stage under the lights of a full stadium at night: the gold of it, the gold
// light coming down on it, the confetti
const art = TROPHY_ART;
const CUP = { x: 192, y: 56, size: 20 };
const FLOODS = [
  { x: 46, y: 14 },
  { x: 338, y: 14 },
];

function standColor({ x, y }) {
  if (y > 24 && hash(x, y) > 0.985) {
    return art.lights[Math.floor(hash(x, y, 2) * 4)];
  }

  if (y < 22) {
    return art.night[0];
  }

  return art.crowd[(Math.floor((y - 22) / 3) % 2) + Number(hash(x >> 1, y) > 0.6)];
}

function paintStands(raster) {
  for (let y = 0; y < 132; y += 1) {
    for (let x = 0; x < 384; x += 1) {
      plot(raster, x, y, standColor({ x, y }));
    }
  }

  FLOODS.forEach((flood) => {
    glow(raster, {
      ...flood,
      radius: 26,
      colors: [art.night[3], art.lights[2], art.lights[1], art.lights[0]],
      squash: 0.7,
    });
  });
}

function paintBeams(raster) {
  FLOODS.forEach((flood) => {
    for (let y = flood.y; y < 140; y += 1) {
      const along = (y - flood.y) / (140 - flood.y);
      const center = flood.x + (CUP.x - flood.x) * along;
      const half = 4 + along * 26;

      for (let x = Math.round(center - half); x <= center + half; x += 1) {
        if (mixes(x, y, 0.28)) {
          plot(raster, x, y, art.lights[along > 0.7 ? 1 : 2]);
        }
      }
    }
  });
}

function paintStage(raster) {
  glow(raster, {
    x: CUP.x,
    y: CUP.y + 20,
    radius: 70,
    colors: [art.gold[1], art.gold[2], art.gold[3]],
    squash: 0.9,
  });
  fillRect(raster, { x: 0, y: 132, width: 384, height: 84 }, art.stage[0]);
  fillRect(raster, { x: 40, y: 136, width: 304, height: 6 }, art.stage[3]);
  hline(raster, { x: 40, y: 136, length: 304 }, art.gold[3]);
  fillRect(raster, { x: 40, y: 142, width: 304, height: 30 }, art.cloth[1]);

  for (let fold = 44; fold < 344; fold += 8) {
    fillRect(raster, { x: fold, y: 142, width: 2, height: 30 }, art.cloth[0]);
    plot(raster, fold + 3, 143, art.cloth[2]);
  }

  hline(raster, { x: 40, y: 142, length: 304 }, art.gold[4]);
  hline(raster, { x: 40, y: 145, length: 304 }, art.gold[2]);
  const { bottom } = paintTrophy(raster, { ...CUP, gold: art.gold, plinth: art.stage });

  fillRect(raster, { x: 166, y: bottom, width: 52, height: 136 - bottom }, art.stage[2]);
  hline(raster, { x: 166, y: bottom, length: 52 }, art.gold[4]);
  hline(raster, { x: 166, y: 133, length: 52 }, art.gold[2]);
}

function drawConfetti(context, tick) {
  for (let i = 0; i < 70; i += 1) {
    const fall = ((hash(i, 1) * 230 + tick * (0.35 + hash(i, 2) * 0.4)) % 230) - 10;
    const x = (hash(i, 3) * 384 + Math.sin(tick / 20 + i) * 4) % 384;
    const turned = Math.floor(tick / 6 + i) % 3;

    artRect(
      context,
      { x, y: fall, width: turned === 0 ? 2 : 1, height: turned === 2 ? 2 : 1 },
      art.confetti[i % art.confetti.length],
    );
  }
}

function drawSparkle(context, tick) {
  const slot = Math.floor(tick / 18);
  const x = CUP.x - 10 + Math.floor(hash(slot, 1) * 12);
  const y = CUP.y + 2 + Math.floor(hash(slot, 2) * 20);

  if (tick % 18 < 10) {
    artRect(context, { x, y }, art.gold[5]);
    [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ].forEach(([dx, dy]) => artRect(context, { x: x + dx, y: y + dy }, art.gold[4]));
  }
}

export const TROPHY_STAGE = {
  paint: (raster) => {
    paintStands(raster);
    paintBeams(raster);
    paintStage(raster);
  },
  overlay: (context, tick) => {
    drawSparkle(context, tick);
    drawConfetti(context, tick);
  },
};
