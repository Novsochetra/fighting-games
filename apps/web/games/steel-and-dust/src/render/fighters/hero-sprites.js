import { RENDER_SCALE } from '../../config.js';
import { HERO_SPRITES, ONE_ROW_STRIPS } from '../../data/hero-sprites.js';
import { createTintCache, frameSource } from './tint.js';

function stripPath(hero, name) {
  return ONE_ROW_STRIPS.has(name) ? hero.ultStrip : `${hero.directory}hero_${name}.png`;
}

// a strip that fails to load settles the sheet too, so a missing file cannot hold the loading
// screen up forever; the sheet is only drawn from once every strip is in
function watchStrips(sheet, images) {
  let waiting = images.length;
  let failed = false;
  const settle = () => {
    waiting -= 1;
    sheet.settled = waiting === 0;
    sheet.ready = sheet.settled && !failed;
  };
  for (const image of images) {
    image.onload = settle;
    image.onerror = () => {
      failed = true;
      settle();
    };
  }
}

export function loadHeroSprites({ createImage, createCanvas, baseUrl, hero, theme }) {
  const tints = createTintCache(createCanvas);
  const sheet = { images: {}, tints, ready: false, settled: false, theme };
  const names = Object.keys(HERO_SPRITES.frames);
  for (const name of names) {
    sheet.images[name] = createImage();
  }
  watchStrips(sheet, Object.values(sheet.images));
  for (const name of names) {
    sheet.images[name].src = `${baseUrl}${stripPath(hero, name)}`;
  }
  return sheet;
}

// a one-row strip may stand taller than the rest (a sword raised to the sky); its feet keep the same
// gap above its bottom edge
export function frameBox(sheet, name) {
  const { frameHeight, feetY } = HERO_SPRITES;
  if (!ONE_ROW_STRIPS.has(name)) {
    return { frameHeight, feetY };
  }
  const height = sheet.images[name].height || frameHeight;
  return { frameHeight: height, feetY: height - (frameHeight - feetY) };
}

export function drawHeroFrame(painter, sheet, { frame: [name, index], x, y, facing, tint, row }) {
  const { frameWidth, feetX, scale } = HERO_SPRITES;
  const { frameHeight, feetY } = frameBox(sheet, name);
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
