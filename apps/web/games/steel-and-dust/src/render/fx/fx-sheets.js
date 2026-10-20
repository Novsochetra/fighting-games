import { RENDER_SCALE } from '../../config.js';
import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { tintedImage } from '../fighters/tint.js';

const DIRECTORY = 'assets/sprites/fx/';

export function loadFxSheets({ createImage, createCanvas, baseUrl }) {
  const sheets = { images: {}, ready: {}, tints: {}, createCanvas };
  for (const name of Object.keys(FX_SPRITES)) {
    const image = createImage();
    image.onload = () => {
      sheets.ready[name] = true;
    };
    image.src = `${baseUrl}${DIRECTORY}${name}.png`;
    sheets.images[name] = image;
  }
  return sheets;
}

function sheetImage(sheets, name, tint) {
  const image = sheets.images[name];
  if (!tint) {
    return image;
  }
  return tintedImage(sheets.tints, {
    image,
    key: name,
    color: tint,
    createCanvas: sheets.createCanvas,
  });
}

// one frame of an effect strip with its anchor on (x, y); scale 1 is the hero sprites' density
export function drawFxFrame(painter, sheets, { name, frame, x, y, scale = 1, facing = 1, tint }) {
  if (!sheets.ready[name]) {
    return;
  }
  const { frameWidth, frameHeight, anchorX, anchorY } = FX_SPRITES[name];
  const size = scale * FX_SCALE;
  const context = painter.context;
  context.save();
  context.translate(
    Math.round(x * RENDER_SCALE) / RENDER_SCALE,
    Math.round(y * RENDER_SCALE) / RENDER_SCALE,
  );
  context.scale(facing < 0 ? -size : size, size);
  context.drawImage(
    sheetImage(sheets, name, tint),
    frame * frameWidth,
    0,
    frameWidth,
    frameHeight,
    -anchorX,
    -anchorY,
    frameWidth,
    frameHeight,
  );
  context.restore();
}

export function fxFrameAt(name, time) {
  const { frames, ticks } = FX_SPRITES[name];
  return Math.min(frames - 1, Math.floor(Math.max(0, time) / ticks));
}
