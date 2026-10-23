import { RENDER_SCALE } from '../../config.js';
import { ENEMY_ATLAS } from '../../data/enemies/atlas/index.js';
import { ENEMY_SPRITES } from '../../data/enemies/enemy-sprites.js';
import { PIXEL, snap } from '../fx/fine-pixels.js';
import { frameSource } from './tint.js';

// a span computed a hair past a whole screen pixel still ends on it
const EPSILON = 1e-6;
// a screen pixel centred exactly on the line between two sheet pixels takes the first, as the grid
// sheets mostly drew it, however the browser's rounding leans; no other pixel centre of a frame at
// any enemy's scale comes this close to such a line
export const TIE_BREAK = 1 / 1024;

// a boss is drawn at its own scale, so its art grows with the reach of its blows and the points its
// effects leave from; raiders are drawn as their sheets are
export const spriteSize = (fighter) => (fighter.def.boss ? fighter.scale : 1);

// a boss drawn at its own scale has its frame's edges cut to whole screen pixels, and so has every
// copy of it (a flash, the red wash, an afterimage, a mirage, a rim of light), which must lie on it
// exactly; each sheet pixel then takes the same share of the frame as it always has
function cellPlacement(sprite, size) {
  const { frameWidth, frameHeight, feetX, feetY } = sprite;
  const scale = size / (RENDER_SCALE * (sprite.density ?? 1));
  const left = snap(-feetX * scale);
  const top = snap(-feetY * scale);
  return {
    left,
    top,
    stepX: (snap((frameWidth - feetX) * scale) - left) / frameWidth,
    stepY: (snap((frameHeight - feetY) * scale) - top) / frameHeight,
  };
}

// a piece's span along one axis where its frame would have put it, drawn in from both ends to
// whole screen pixels: the pixels left off would only have shown the clear pixel round the piece
function landing(cellStart, step, { offset, length }) {
  const from = Math.ceil((cellStart + offset * step) / PIXEL - EPSILON) * PIXEL;
  const to = Math.floor((cellStart + (offset + length) * step) / PIXEL + EPSILON) * PIXEL;
  return {
    from,
    size: to - from,
    skip: (from - cellStart) / step - offset - TIE_BREAK,
    length: (to - from) / step,
  };
}

function drawPiece(context, source, { across, down, x, y, facing }) {
  context.save();
  context.translate(snap(x), snap(y));
  if (facing < 0) {
    context.scale(-1, 1);
  }
  context.drawImage(
    source.image,
    source.sx + across.skip,
    source.sy + down.skip,
    across.length,
    down.length,
    across.from,
    down.from,
    across.size,
    down.size,
  );
  context.restore();
}

export function drawEnemyFrame(
  painter,
  sheets,
  { id, frame: [name, index], x, y, facing, tint, size = 1 },
) {
  const sprite = ENEMY_SPRITES[id];
  // [x, y, width, height, left, top]: the piece in the packed sheet and where it sat in its frame
  const piece = ENEMY_ATLAS[id][sprite.strips[name].row]?.[index];
  if (!piece) {
    return;
  }
  const [sx, sy, width, height, inLeft, inTop] = piece;
  const source = frameSource(sheets.tints, {
    image: sheets.images[id],
    key: id,
    color: tint,
    sx,
    sy,
    width,
    height,
  });
  const cell = cellPlacement(sprite, size);
  drawPiece(painter.context, source, {
    across: landing(cell.left, cell.stepX, { offset: inLeft, length: width }),
    down: landing(cell.top, cell.stepY, { offset: inTop, length: height }),
    x,
    y,
    facing,
  });
}
