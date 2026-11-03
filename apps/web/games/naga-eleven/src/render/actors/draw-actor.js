import { animationName, frameOf } from './animation.js';
import { rowFor } from './directions.js';
import { coloursOf, drawBuffer } from './figure/draw-buffer.js';
import { figureFrame } from './figure/frames.js';
import { drawShirtNumber } from './shirt-number.js';
import { sheetOf } from './sheets.js';

function drawFrameOf(context, sheet, { source, left, top, mirror }) {
  const { x, y, width, height } = source;

  if (!mirror) {
    context.drawImage(sheet, x, y, width, height, left, top, width, height);

    return;
  }

  context.save();
  context.translate(left + width, top);
  context.scale(-1, 1);
  context.drawImage(sheet, x, y, width, height, 0, 0, width, height);
  context.restore();
}

// a player's frame, its anchor (the point between the feet) on the ground point x, y, at 1x, with
// his shirt's number on it when one is given; an animation may have a frame and an anchor of its own
export function drawActor(context, art, { look, state, x, y, number }) {
  const { manifest } = art;
  const name = animationName(manifest.animations, state);
  const animation = manifest.animations[name];
  const frame = frameOf(animation, state);
  const { row, mirror, drawn } = rowFor(animation.rows, state.direction);
  const { width, height } = animation.frame ?? manifest.frame;
  const anchor = animation.anchor ?? manifest.anchor;
  const left = Math.round(x) - (mirror ? width - anchor.x : anchor.x);
  const top = Math.round(y) - anchor.y;
  const sheet = sheetOf(art, look, name);

  if (sheet) {
    const source = { x: frame * width, y: row * height, width, height };

    drawFrameOf(context, sheet, { source, left, top, mirror });
    drawShirtNumber(context, art, { look, number, at: { name, row, mirror, frame }, left, top });
  } else if (!art.images) {
    drawBuffer(context, figureFrame(name, drawn, frame), {
      left,
      top,
      mirror,
      colours: coloursOf(look),
    });
  }
}
