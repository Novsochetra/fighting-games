import { RENDER_SCALE } from '../../config.js';
import { HERO_SPRITES, ONE_ROW_STRIPS } from '../../data/hero-sprites.js';
import { tintedImage } from './tint.js';

function stripPath(hero, name) {
  return ONE_ROW_STRIPS.has(name) ? hero.ultStrip : `${hero.directory}hero_${name}.png`;
}

export function loadHeroSprites({ createImage, createCanvas, baseUrl, hero, theme }) {
  const sheet = { images: {}, tints: {}, ready: false, createCanvas, theme };
  const names = Object.keys(HERO_SPRITES.frames);
  let waiting = names.length;
  for (const name of names) {
    const image = createImage();
    image.onload = () => {
      waiting -= 1;
      sheet.ready = waiting === 0;
    };
    image.src = `${baseUrl}${stripPath(hero, name)}`;
    sheet.images[name] = image;
  }
  return sheet;
}

function tinted(sheet, name, color) {
  const image = sheet.images[name];
  return tintedImage(sheet.tints, { image, key: name, color, createCanvas: sheet.createCanvas });
}

export function drawHeroFrame(painter, sheet, { frame: [name, index], x, y, facing, tint, row }) {
  const { frameWidth, frameHeight, feetX, feetY, scale } = HERO_SPRITES;
  const context = painter.context;
  const image = tint ? tinted(sheet, name, tint) : sheet.images[name];
  const sourceRow = ONE_ROW_STRIPS.has(name) ? 0 : row || 0;
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
    sourceRow * frameHeight,
    frameWidth,
    frameHeight,
    -feetX * scale,
    -feetY * scale,
    frameWidth * scale,
    frameHeight * scale,
  );
  context.restore();
}
