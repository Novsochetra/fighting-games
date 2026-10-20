import { RENDER_SCALE } from '../../config.js';
import { ENEMY_SPRITES } from '../../data/enemies/enemy-sprites.js';
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

export function drawEnemyFrame(painter, sheets, { id, frame: [name, index], x, y, facing, tint }) {
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
  const scale = 1 / RENDER_SCALE;
  const context = painter.context;
  context.save();
  context.translate(
    Math.round(x * RENDER_SCALE) / RENDER_SCALE,
    Math.round(y * RENDER_SCALE) / RENDER_SCALE,
  );
  if (facing < 0) {
    context.scale(-1, 1);
  }
  context.drawImage(
    source.image,
    source.sx,
    source.sy,
    frameWidth,
    frameHeight,
    -feetX * scale,
    -feetY * scale,
    frameWidth * scale,
    frameHeight * scale,
  );
  context.restore();
}
