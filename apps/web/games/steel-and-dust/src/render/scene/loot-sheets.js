import { LOOT_SPRITES } from '../../data/loot-sprites.js';

const DIRECTORY = 'assets/sprites/loot/';

export function loadLootSheets({ createImage, baseUrl }) {
  const sheets = { images: {}, ready: {} };
  for (const [name, sprite] of Object.entries(LOOT_SPRITES)) {
    const image = createImage();
    image.onload = () => {
      sheets.ready[name] = true;
    };
    image.src = `${baseUrl}${DIRECTORY}${sprite.file}`;
    sheets.images[name] = image;
  }
  return sheets;
}

// a sprite's pixels land on its own pixel grid (whole screen pixels at the world's 2x), or a
// canvas smooths their edges
function snap(value, pixelsPerUnit) {
  return Math.round(value * pixelsPerUnit) / pixelsPerUnit;
}

// one frame with the middle of its bottom edge on (x, y); `zoom` grows it by whole strip pixels
export function drawLootFrame(painter, sheets, { name, frame, x, y, zoom = 1 }) {
  if (!sheets.ready[name]) {
    return;
  }
  const { frameWidth, frameHeight } = LOOT_SPRITES[name];
  const scale = LOOT_SPRITES[name].scale * zoom;
  const width = frameWidth * scale;
  const height = frameHeight * scale;
  const unit = 1 / scale;
  painter.context.drawImage(
    sheets.images[name],
    frame * frameWidth,
    0,
    frameWidth,
    frameHeight,
    snap(x - width / 2, unit),
    snap(y - height, unit),
    width,
    height,
  );
}
