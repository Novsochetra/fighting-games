import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { lastOf } from '../../lib/lists.js';
import { clamp } from '../../lib/math.js';
import { PIXEL, snap } from './fine-pixels.js';

// a strip laid along a slanting line (a lance diving, a chain, a flying hook) is never rotated,
// which smooths every pixel of it: its columns of screen pixels stay upright and step down the
// slant one screen pixel at a time, as pixel art draws a slope. A line steeper than a diagonal is
// laid a quarter turn round first, which keeps every pixel whole, and steps across instead
const QUARTER = Math.PI / 2;

function addColumn(runs, { column, source, drop }) {
  const last = lastOf(runs);
  if (last && last.drop === drop && last.left + last.width === column * PIXEL) {
    last.width += PIXEL;
    last.sourceEnd = source + 1;
    return;
  }
  runs.push({
    left: column * PIXEL,
    width: PIXEL,
    sourceStart: source,
    sourceEnd: source + 1,
    drop,
  });
}

// the screen-pixel columns a frame covers along a slant of up to a diagonal, joined into runs that
// step together: each run's columns of the frame, where it lies along the line and how far down it
// has stepped. `shift` is how far along the line the frame's anchor lies; `window` cuts the line
export function slantRuns(sprite, { size, slant = 0, shift = 0, window = {} }) {
  const { frameWidth, anchorX } = sprite;
  const squeeze = Math.cos(slant);
  const from = Math.max(window.from ?? -Infinity, shift - anchorX * size);
  const to = Math.min(window.to ?? Infinity, shift + (frameWidth - anchorX) * size);
  const runs = [];
  const end = Math.round((to * squeeze) / PIXEL);
  for (let column = Math.round((from * squeeze) / PIXEL); column < end; column++) {
    const along = (column + 0.5) * PIXEL;
    const at = Math.floor(anchorX + (along / squeeze - shift) / size);
    addColumn(runs, {
      column,
      source: clamp(at, 0, frameWidth - 1),
      drop: snap(along * Math.tan(slant)),
    });
  }
  return runs;
}

function drawRuns(context, { image, sprite, frame, runs, size }) {
  const { frameWidth, frameHeight, anchorY } = sprite;
  const top = snap(-anchorY * size);
  const height = snap((frameHeight - anchorY) * size) - top;
  for (const run of runs) {
    context.drawImage(
      image,
      frame * frameWidth + run.sourceStart,
      0,
      run.sourceEnd - run.sourceStart,
      frameHeight,
      run.left,
      top + run.drop,
      run.width,
      height,
    );
  }
}

// one frame of an effect strip with its anchor on the line's point (x, y), laid along the line as
// if turned by `angle` (down is positive) after facing `facing`
export function drawSlantedFrame(painter, sheets, { name, frame, scale = 1, line, ...cut }) {
  if (!sheets.ready[name]) {
    return;
  }
  const { x, y, facing = 1, angle = 0 } = line;
  const turn = Math.abs(angle) > QUARTER / 2 ? Math.sign(angle) : 0;
  const sprite = FX_SPRITES[name];
  const size = scale * FX_SCALE;
  const runs = slantRuns(sprite, { size, slant: angle - turn * QUARTER, ...cut });
  const context = painter.context;
  context.save();
  context.translate(snap(x), snap(y));
  context.scale(facing, 1);
  if (turn) {
    context.transform(0, turn, -turn, 0, 0, 0);
  }
  drawRuns(context, { image: sheets.images[name], sprite, frame, runs, size });
  context.restore();
}
