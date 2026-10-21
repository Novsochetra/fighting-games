import { RENDER_SCALE } from '../../config.js';
import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { createTintCache, frameSource } from '../fighters/tint.js';

const DIRECTORY = 'assets/sprites/fx/';

export function loadFxSheets({ createImage, createCanvas, baseUrl }) {
  const sheets = { images: {}, ready: {}, tints: createTintCache(createCanvas) };
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

// one frame of an effect strip with its anchor on (x, y); scale 1 is the hero sprites' density;
// angle (radians, clockwise) turns it about the anchor before it is mirrored to face left
export function drawFxFrame(painter, sheets, at) {
  const { name, frame, x, y, scale = 1, facing = 1, tint, angle = 0 } = at;
  if (!sheets.ready[name]) {
    return;
  }
  const { frameWidth, frameHeight, anchorX, anchorY } = FX_SPRITES[name];
  const source = frameSource(sheets.tints, {
    image: sheets.images[name],
    key: name,
    color: tint,
    sx: frame * frameWidth,
    sy: 0,
    width: frameWidth,
    height: frameHeight,
  });
  const size = scale * FX_SCALE;
  const context = painter.context;
  context.save();
  context.translate(
    Math.round(x * RENDER_SCALE) / RENDER_SCALE,
    Math.round(y * RENDER_SCALE) / RENDER_SCALE,
  );
  context.scale(facing < 0 ? -size : size, size);
  if (angle) {
    context.rotate(angle);
  }
  context.drawImage(
    source.image,
    source.sx,
    source.sy,
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
