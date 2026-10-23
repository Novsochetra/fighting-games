import { RENDER_SCALE } from '../../config.js';
import { ENEMY_SPRITES } from '../../data/enemies/enemy-sprites.js';
import { snap } from '../fx/fine-pixels.js';
import { createTintCache, frameSource } from './tint.js';

const DIRECTORY = 'assets/sprites/enemies/';

export function loadEnemySprites({ createImage, createCanvas, baseUrl }) {
  const sheets = { images: {}, ready: {}, tints: createTintCache(createCanvas) };
  for (const [id, sprite] of Object.entries(ENEMY_SPRITES)) {
    const image = createImage();
    image.onload = () => {
      sheets.ready[id] = true;
    };
    image.src = `${baseUrl}${DIRECTORY}${sprite.file}`;
    sheets.images[id] = image;
  }
  return sheets;
}

export function hasEnemySprite(sheets, id) {
  return Boolean(id && sheets.ready[id]);
}

// a boss is drawn at its own scale, so its art grows with the reach of its blows and the points its
// effects leave from; raiders are drawn as their sheets are
export const spriteSize = (fighter) => (fighter.def.boss ? fighter.scale : 1);

export function drawEnemyFrame(
  painter,
  sheets,
  { id, frame: [name, index], x, y, facing, tint, size = 1 },
) {
  const sprite = ENEMY_SPRITES[id];
  const { frameWidth, frameHeight, feetX, feetY } = sprite;
  const source = frameSource(sheets.tints, {
    image: sheets.images[id],
    key: id,
    color: tint,
    sx: index * frameWidth,
    sy: sprite.strips[name].row * frameHeight,
    width: frameWidth,
    height: frameHeight,
  });
  const scale = size / (RENDER_SCALE * (sprite.density ?? 1));
  // a boss drawn at its own scale has its edges cut to whole screen pixels, and so has every copy of
  // it (a flash, the red wash, an afterimage, a mirage, a rim of light), which must lie on it exactly
  const left = snap(-feetX * scale);
  const top = snap(-feetY * scale);
  const context = painter.context;
  context.save();
  context.translate(snap(x), snap(y));
  if (facing < 0) {
    context.scale(-1, 1);
  }
  context.drawImage(
    source.image,
    source.sx,
    source.sy,
    frameWidth,
    frameHeight,
    left,
    top,
    snap((frameWidth - feetX) * scale) - left,
    snap((frameHeight - feetY) * scale) - top,
  );
  context.restore();
}
