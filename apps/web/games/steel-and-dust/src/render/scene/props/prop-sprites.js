import { RENDER_SCALE } from '../../../config.js';
import { PROP_SPRITES } from '../../../data/prop-sprites.js';

const DIRECTORY = 'assets/sprites/props/';

export function loadPropSprites({ createImage, baseUrl }) {
  const sheets = { images: {}, ready: {} };
  for (const [kind, sprite] of Object.entries(PROP_SPRITES)) {
    const image = createImage();
    image.onload = () => {
      sheets.ready[kind] = true;
    };
    image.src = `${baseUrl}${DIRECTORY}${sprite.file}`;
    sheets.images[kind] = image;
  }
  return sheets;
}

export function isSpriteProp(kind) {
  return Object.hasOwn(PROP_SPRITES, kind);
}

export function drawPropSprite(painter, sheets, { kind, x, y }) {
  if (!sheets.ready[kind]) {
    return;
  }
  const { feetX, feetY } = PROP_SPRITES[kind];
  const image = sheets.images[kind];
  painter.context.drawImage(
    image,
    Math.round(x - feetX / RENDER_SCALE),
    Math.round(y - feetY / RENDER_SCALE),
    image.width / RENDER_SCALE,
    image.height / RENDER_SCALE,
  );
}
