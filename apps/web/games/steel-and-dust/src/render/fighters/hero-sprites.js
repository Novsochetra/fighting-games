import { RENDER_SCALE } from '../../config.js';
import { HERO_SPRITES, ONE_ROW_STRIPS } from '../../data/hero-sprites.js';
import { createTintCache, frameSource } from './tint.js';

function stripPath(hero, name) {
  return ONE_ROW_STRIPS.has(name) ? hero.ultStrip : `${hero.directory}hero_${name}.png`;
}

export function loadHeroSprites({ createImage, createCanvas, baseUrl, hero, theme }) {
  const sheet = { images: {}, tints: createTintCache(createCanvas), ready: false, theme };
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

export function drawHeroFrame(painter, sheet, { frame: [name, index], x, y, facing, tint, row }) {
  const { frameWidth, frameHeight, feetX, feetY, scale } = HERO_SPRITES;
  const sourceRow = ONE_ROW_STRIPS.has(name) ? 0 : row || 0;
  const source = frameSource(sheet.tints, {
    image: sheet.images[name],
    key: name,
    color: tint,
    sx: index * frameWidth,
    sy: sourceRow * frameHeight,
    width: frameWidth,
    height: frameHeight,
  });
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
