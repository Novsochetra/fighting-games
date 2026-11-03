import { paintCrowd } from '../crowd/crowd.js';
import { columnOf } from '../layers/frame.js';
import { hash2, noise2 } from '../kit/hash.js';
import { rect, tint } from '../kit/raster.js';
import { inAisle, paintAisles, paintSteps, paintWall } from '../stands/tier.js';

// the grandstand: rows of concrete steps over the halfway line, most of them full, under a tin roof
// held up on thin posts, its back rows in shade
const ROWS = 8;
const PITCH = 9;
const WALL = 8;
const AISLES = { every: 120, width: 6, offset: 60 };

function standSpan(frame, { pitch }) {
  const left = columnOf(frame, pitch.length * 0.3);

  return { left, width: columnOf(frame, pitch.length * 0.7) - left };
}

function paintTinRoof(raster, { left, width, top }, art) {
  rect(raster, { x: left - 8, y: top - 7, width: width + 16, height: 7 }, art.tin[2]);

  for (let x = left - 8; x < left + width + 8; x += 3) {
    rect(raster, { x, y: top - 7, width: 1, height: 7 }, art.tin[1]);
  }

  rect(raster, { x: left - 8, y: top - 8, width: width + 16, height: 1 }, art.tin[4]);
  rect(raster, { x: left - 8, y: top, width: width + 16, height: 2 }, art.tin[0]);
}

function paintSeats(raster, { area, index, art }) {
  const shape = { area, rowPitch: PITCH, aisles: AISLES };
  const concrete = art.concrete;
  const colours = {
    riser: concrete[0],
    edge: concrete[2],
    seat: art.seats.shade,
    stair: concrete[2],
    stairEdge: concrete[3],
  };
  const full = (x, row) =>
    noise2(x, row * 9, { cell: 30, salt: 5 }) + hash2(x, row, 3) * 0.3 > 0.42;

  paintSteps(raster, { ...shape, colours });
  paintAisles(raster, { ...shape, colours });
  paintCrowd(raster, {
    area,
    size: 6,
    rowPitch: PITCH,
    palette: art.crowd,
    frame: index,
    filled: (x, row) => !inAisle(x, shape) && full(x, row),
  });
}

function shadeUnderRoof(raster, { area, art }) {
  for (let y = area.y - 14; y < area.y + 22; y += 1) {
    for (let x = area.x; x < area.x + area.width; x += 1) {
      tint(raster, x, y, { colour: art.shadow, share: 0.45 * (1 - (y - area.y + 14) / 36) });
    }
  }
}

export function paintGrandstand(raster, { frame, index, layout, art }) {
  const { left, width } = standSpan(frame, layout);
  const bottom = raster.height - WALL;
  const area = { x: left, y: bottom - ROWS * PITCH, width, height: ROWS * PITCH };

  paintSeats(raster, { area, index, art });
  shadeUnderRoof(raster, { area, art });
  paintWall(raster, { x: left, y: bottom, width, height: WALL }, art.concrete.slice(1));
  rect(
    raster,
    { x: left - 3, y: area.y - 14, width: 3, height: area.height + 14 },
    art.concrete[1],
  );
  rect(
    raster,
    { x: left + width, y: area.y - 14, width: 3, height: area.height + 14 },
    art.concrete[1],
  );

  for (let x = left; x <= left + width; x += 64) {
    rect(raster, { x, y: area.y - 14, width: 2, height: 14 + area.height }, art.steel[1]);
  }

  paintTinRoof(raster, { left, width, top: area.y - 14 }, art);
}
