import { paintBody } from './body.js';
import { drawFins } from './fins.js';
import { headRaster, quantizedHead, stampHead } from './head.js';
import { asLight } from './light.js';
import { skinOf } from './skin.js';

// where the head stands, at whole pixels and in the steps its drawing is kept in, so what is
// laid over it (the burning eye) lands where the drawing put it
export function headPlace(serpent) {
  const look = quantizedHead(serpent.head);

  return {
    x: Math.round(serpent.head.x),
    y: Math.round(serpent.head.y),
    size: look.size,
    angle: look.angle,
    facing: 1,
  };
}

// it comes out of the ball as light, flickering into its colours as it takes shape
function headColours(serpent, { head, frame }) {
  const lit = serpent.born < 0.55 || (serpent.born < 0.85 && frame % 2 === 0);

  return lit ? asLight(head) : null;
}

export function drawFigure(sheet, { serpent, frames, frame }) {
  const place = headPlace(serpent);
  const head = headRaster(place);

  drawFins(sheet, { frames, frame });
  paintBody(sheet, { frames, paint: skinOf(frame) });
  stampHead(sheet, {
    head,
    at: place,
    recolour: headColours(serpent, { head, frame }),
  });

  return place;
}
