import { RENDER_SCALE } from '../../config.js';
import { createPainter } from '../painter.js';
import { drawStamped } from '../stamps.js';

// room round a box for what a box draws a little past its edge (text shadows, a pop's outline)
const MARGIN = 8;

// a HUD box that changes only now and then (lives, score, weapon, purse) is drawn once into a
// stamp of what it shows and then laid down with one drawImage a frame: drawn part by part it took
// dozens of canvas calls a frame, over half the HUD's time. `key` must name everything the box shows,
// and `ready` whether its art is in, so it is made again once that changes
export function drawBoxStamped(painter, { key, box, ready, draw }) {
  const x = box.x - MARGIN;
  const y = box.y - MARGIN;
  drawStamped(painter, {
    key: `box|${key}|${ready}`,
    x,
    y,
    width: box.width + MARGIN * 2,
    height: box.height + MARGIN * 2,
    resolution: RENDER_SCALE,
    draw: (context, left, top) => {
      context.save();
      context.translate(left - x, top - y);
      draw(createPainter(context, null));
      context.restore();
    },
  });
}
