import { createPen } from '../../../../../src/render/duel/pen.js';
import { VIEW } from '../world.js';

export function worldPen(context, { x, y, unit, shake }) {
  return createPen(context, {
    unit,
    x: VIEW.width / 2 - (x - shake.x) * unit,
    y: VIEW.height / 2 - (y - shake.y) * unit,
  });
}

// a pen for a far layer, which slides by only `depth` of the camera's move, so it reads farther
// off; `anchor` is the point of the world the layer lines up with the near ones at
export function parallaxPen(context, camera, { depth, anchor }) {
  return worldPen(context, {
    ...camera,
    x: anchor.x + (camera.x - anchor.x) * depth,
    y: anchor.y + (camera.y - anchor.y) * depth,
  });
}
