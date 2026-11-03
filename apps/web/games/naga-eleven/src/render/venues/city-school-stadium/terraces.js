import { paintCrowd } from '../crowd/crowd.js';
import { columnOf } from '../layers/frame.js';
import { hash2, noise2 } from '../kit/hash.js';
import { rect } from '../kit/raster.js';
import { paintMast } from '../scenery/floodlight.js';
import { inAisle, paintAisles, paintWall } from '../stands/tier.js';

// the school stadium's terraces: wide concrete steps without seats, the schoolchildren sitting in
// bunches by school, a few standing, a stair every so often
const ROWS = 6;
const PITCH = 9;
const WALL = 6;
const AISLES = { every: 140, width: 8, offset: 60 };

function paintSteps(raster, { area, art }) {
  for (let y = area.y + area.height - PITCH; y >= area.y; y -= PITCH) {
    rect(raster, { x: area.x, y, width: area.width, height: PITCH }, art.concrete[1]);
    rect(raster, { x: area.x, y, width: area.width, height: 3 }, art.concrete[3]);
    rect(raster, { x: area.x, y, width: area.width, height: 1 }, art.concrete[4]);
    rect(raster, { x: area.x, y: y + PITCH - 1, width: area.width, height: 1 }, art.concrete[0]);
  }
}

export function paintTerraces(raster, { index, art }) {
  const bottom = raster.height - WALL;
  const area = { x: 0, y: bottom - ROWS * PITCH, width: raster.width, height: ROWS * PITCH };
  const shape = { area, rowPitch: PITCH, aisles: AISLES };
  const stairs = {
    riser: art.concrete[0],
    edge: art.concrete[3],
    seat: art.concrete[1],
    stair: art.concrete[2],
    stairEdge: art.concrete[4],
  };

  paintSteps(raster, { area, art });
  paintAisles(raster, { ...shape, colours: stairs });
  paintCrowd(raster, {
    area,
    size: 6,
    rowPitch: PITCH,
    palette: art.crowd,
    frame: index,
    filled: (x, row) =>
      !inAisle(x, shape) &&
      noise2(x, row * 13, { cell: 46, salt: 21 }) + hash2(x, row, 23) * 0.25 > 0.5,
  });
  paintWall(raster, { x: 0, y: bottom, width: raster.width, height: WALL }, art.concrete.slice(2));
  rect(raster, { x: 0, y: area.y - 3, width: raster.width, height: 3 }, art.concrete[2]);
}

// the masts stand behind the terraces at the corners and between, the city beyond them
export function paintMasts(raster, { frame, layout, art }) {
  for (const share of [-0.04, 0.33, 0.67, 1.04]) {
    paintMast(
      raster,
      { x: columnOf(frame, layout.pitch.length * share), top: 2, base: raster.height },
      { steel: art.steel, lamp: art.concrete[4] },
    );
  }
}
