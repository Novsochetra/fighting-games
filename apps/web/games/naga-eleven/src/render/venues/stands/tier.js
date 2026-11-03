import { rect } from '../kit/raster.js';

// the concrete of a stand behind its fans: a step edge catching the light, a seat, and the riser
// below in shade, row after row; stairs run up it every `aisles.every` pixels
export function paintSteps(raster, { area, rowPitch, colours }) {
  for (let y = area.y + area.height - rowPitch; y >= area.y; y -= rowPitch) {
    rect(raster, { x: area.x, y, width: area.width, height: rowPitch }, colours.riser);
    rect(raster, { x: area.x, y, width: area.width, height: 1 }, colours.edge);
    rect(raster, { x: area.x, y: y + 1, width: area.width, height: 2 }, colours.seat);
  }
}

export function paintAisles(raster, { area, rowPitch, aisles, colours }) {
  for (let x = area.x + aisles.offset; x < area.x + area.width; x += aisles.every) {
    rect(raster, { x, y: area.y, width: aisles.width, height: area.height }, colours.stair);

    for (let y = area.y + area.height - rowPitch; y >= area.y; y -= rowPitch) {
      rect(raster, { x, y, width: aisles.width, height: 1 }, colours.stairEdge);
    }

    rect(raster, { x, y: area.y, width: 1, height: area.height }, colours.stairEdge);
  }
}

export const inAisle = (x, { area, aisles }) => {
  const along = (x - area.x - aisles.offset) % aisles.every;

  return along >= -1 && along < aisles.width + 1;
};

// a wall with a lit top edge and a shadowed foot
export function paintWall(raster, { x, y, width, height }, colours) {
  rect(raster, { x, y, width, height }, colours[1]);
  rect(raster, { x, y, width, height: 1 }, colours[2]);
  rect(raster, { x, y: y + height - 1, width, height: 1 }, colours[0]);
}
