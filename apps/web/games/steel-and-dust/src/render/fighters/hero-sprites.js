import { RENDER_SCALE } from '../../config.js';
import { HERO_SPRITES } from '../../data/hero-sprites.js';

export function loadHeroSprites({ createImage, createCanvas, baseUrl }) {
  const sheet = { images: {}, tints: {}, ready: false, createCanvas };
  const names = Object.keys(HERO_SPRITES.frames);
  let waiting = names.length;
  for (const name of names) {
    const image = createImage();
    image.onload = () => {
      waiting -= 1;
      sheet.ready = waiting === 0;
    };
    image.src = `${baseUrl}${HERO_SPRITES.directory}hero_${name}.png`;
    sheet.images[name] = image;
  }
  return sheet;
}

// a solid-color copy of a strip, for flashes, glows and afterimages
function tinted(sheet, name, color) {
  const key = name + color;
  if (!sheet.tints[key]) {
    const image = sheet.images[name];
    const canvas = sheet.createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    sheet.tints[key] = canvas;
  }
  return sheet.tints[key];
}

export function drawHeroFrame(painter, sheet, { frame: [name, index], x, y, facing, tint, row }) {
  const { frameWidth, frameHeight, feetX, feetY, scale } = HERO_SPRITES;
  const context = painter.context;
  const image = tint ? tinted(sheet, name, tint) : sheet.images[name];
  context.save();
  context.translate(
    Math.round(x * RENDER_SCALE) / RENDER_SCALE,
    Math.round(y * RENDER_SCALE) / RENDER_SCALE,
  );
  if (facing < 0) {
    context.scale(-1, 1);
  }
  context.drawImage(
    image,
    index * frameWidth,
    (row || 0) * frameHeight,
    frameWidth,
    frameHeight,
    -feetX * scale,
    -feetY * scale,
    frameWidth * scale,
    frameHeight * scale,
  );
  context.restore();
}
