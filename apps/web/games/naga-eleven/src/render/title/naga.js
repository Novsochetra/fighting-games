import { NAGA_EYES, NAGA_HEAD, nagaHeadKeys } from '../../art/title/naga-head.js';
import { createRaster, hline, plot, stampRaster } from '../backdrops/raster.js';
import { disc, ellipse } from '../backdrops/shapes.js';

// The great seven-headed Naga: its body rising out of the moat, splitting into seven necks that
// arch out to seven heads over a jade hood rimmed in gold. `x`, `y` is where the necks part.

const SPREAD = [-74, -52, -27, 0, 27, 52, 74];
const RISE = [30, 48, 58, 62, 58, 48, 30];

export const headSpots = ({ x, y }) =>
  SPREAD.map((offset, i) => ({ x: x + offset, y: y - RISE[i] }));

export const nagaEyes = (heart) =>
  headSpots(heart).flatMap((spot) =>
    NAGA_EYES.map((eye) => ({ x: spot.x - 10 + eye.x, y: spot.y - 10 + eye.y })),
  );

// a serpent's body is laid in bands from the outside in: outline, jade back, gold belly, sheen
const TUBE_BANDS = [
  { share: 1, color: (art) => art.gold[0] },
  { share: 0.82, color: (art) => art.jade[2] },
  { share: 0.55, color: (art) => art.jade[3] },
  { share: 0.38, color: (art) => art.gold[3] },
  { share: 0.12, color: (art) => art.gold[4] },
];

const curveAt = ({ from, bend, to }, along) => {
  const keep = 1 - along;

  return {
    x: keep * keep * from.x + 2 * keep * along * bend.x + along * along * to.x,
    y: keep * keep * from.y + 2 * keep * along * bend.y + along * along * to.y,
  };
};

// a thick serpent's body along a curve from `from` to `to`, bowed through `bend`, its gold belly
// toward us and its jade back on either side
export function paintTube(raster, { curve, width, taper = 0.25, art }) {
  const span =
    Math.hypot(curve.bend.x - curve.from.x, curve.bend.y - curve.from.y) +
    Math.hypot(curve.to.x - curve.bend.x, curve.to.y - curve.bend.y);
  const steps = Math.ceil(span * 2);

  TUBE_BANDS.forEach((band) => {
    for (let step = 0; step <= steps; step += 1) {
      const point = curveAt(curve, step / steps);
      const half = Math.max(0.5, width * (1 - (step / steps) * taper) * band.share);
      const lean = band.share < 0.5 ? -half * 0.4 : 0;

      disc(raster, { x: point.x + lean, y: point.y, radius: half }, band.color(art));
    }
  });
}

function paintHood(raster, { x, y, art }) {
  for (let dy = -46; dy <= 8; dy += 1) {
    for (let dx = -64; dx <= 64; dx += 1) {
      const edge = Math.hypot(dx / 64, dy / 46);
      const scale = (Math.floor((dx + dy + 400) / 4) + Math.floor((dx - dy + 400) / 4)) % 2;

      if (edge <= 1) {
        plot(raster, x + dx, y + dy, edge > 0.92 ? art.gold[edge > 0.97 ? 2 : 3] : art.jade[scale]);
      }
    }
  }
}

// each head flares a hood of its own behind it, as a cobra does
function paintCobraHood(raster, { x, y, art }) {
  ellipse(raster, { x, y: y + 3, radiusX: 15, radiusY: 11 }, art.gold[1]);
  ellipse(raster, { x, y: y + 3, radiusX: 14, radiusY: 10 }, art.jade[1]);
  ellipse(raster, { x: x - 3, y: y + 1, radiusX: 8, radiusY: 6 }, art.jade[2]);
}

function paintTongue(raster, { x, y, art }) {
  [0, 1, 2].forEach((drop) => plot(raster, x, y + 11 + drop, art.eye[0]));
  plot(raster, x - 1, y + 14, art.eye[0]);
  plot(raster, x + 1, y + 14, art.eye[0]);
}

function paintHead(raster, { x, y, keys }) {
  NAGA_HEAD.forEach((row, line) => {
    [...row].forEach((key, column) => {
      if (key !== '.') {
        plot(raster, x - 10 + column, y - 10 + line, keys[key]);
      }
    });
  });
}

// the coils breaking the water either side, cut off where they go under
export function paintHumps(raster, { x, waterline, art }) {
  const own = createRaster(raster.width, raster.height);
  const humps = [
    {
      from: { x: x - 176, y: waterline + 10 },
      bend: { x: x - 140, y: waterline - 52 },
      to: { x: x - 100, y: waterline + 10 },
    },
    {
      from: { x: x + 104, y: waterline + 10 },
      bend: { x: x + 140, y: waterline - 44 },
      to: { x: x + 176, y: waterline + 10 },
    },
  ];

  humps.forEach((curve, i) => paintTube(own, { curve, width: 9, taper: i ? 0.6 : 0.1, art }));
  own.data.fill(0, (waterline + 1) * raster.width * 4);
  stampRaster(raster, own, { x: 0, y: 0 });
  humps
    .flatMap((curve) => [curve.from, curve.to])
    .forEach((end) => {
      hline(raster, { x: end.x - 12, y: waterline + 1, length: 24 }, art.rays[2]);
      hline(raster, { x: end.x - 7, y: waterline + 3, length: 14 }, art.rays[1]);
    });
}

function paintCoils(raster, { x, y, art, bottom }) {
  paintTube(raster, {
    curve: { from: { x, y: bottom }, bend: { x: x - 6, y: y + 34 }, to: { x, y: y + 6 } },
    width: 15,
    taper: 0.2,
    art,
  });
}

export function paintNaga(raster, { x, y, art, bottom }) {
  const keys = nagaHeadKeys(art);
  const spots = headSpots({ x, y });
  const order = [0, 6, 1, 5, 2, 4, 3];

  paintHood(raster, { x, y: y - 4, art });
  paintCoils(raster, { x, y, art, bottom });
  order.forEach((i) => {
    const spot = spots[i];
    const from = { x: x + SPREAD[i] * 0.15, y: y + 10 };
    const bend = { x: x + SPREAD[i] * 1.25, y: y - RISE[i] * 0.15 };

    paintTube(raster, { curve: { from, bend, to: { x: spot.x, y: spot.y + 9 } }, width: 7, art });
  });
  order.forEach((i) => {
    paintCobraHood(raster, { ...spots[i], art });
    paintHead(raster, { ...spots[i], keys });
    paintTongue(raster, { ...spots[i], art });
  });
  disc(raster, { x, y: y + 9, radius: 6 }, art.gold[3]);
  disc(raster, { x: x - 1, y: y + 8, radius: 3 }, art.gold[5]);
}
