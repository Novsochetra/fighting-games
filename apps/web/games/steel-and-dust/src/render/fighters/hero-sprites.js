import { RENDER_SCALE } from '../../config.js';
import { HERO_ATLAS } from '../../data/hero-atlas/index.js';
import {
  HERO_SPRITES,
  ONE_ROW_STRIPS,
  packedStripPath,
  stripsOf,
} from '../../data/hero-sprites.js';
import { createTintCache, frameSource } from './tint.js';

// a strip that fails to load settles the sheet too, so a missing file cannot hold the loading
// screen up forever; the sheet is only drawn from once every strip is in, and counts the strips
// still on their way for the loading screen's bar
function watchStrips(sheet, images) {
  sheet.waiting = images.length;
  let failed = false;
  const settle = () => {
    sheet.waiting -= 1;
    sheet.settled = sheet.waiting === 0;
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

// the strips cut down to their painted pieces: a browser keeps every pixel of a strip it draws, and
// most of a grid strip's cells is empty; a strip's pieces are [frame height, then a row of pieces
// per weapon], each piece [x, y, width, height, left, top], where it is and where it sat in its frame
export function loadHeroSprites({ createImage, createCanvas, baseUrl, hero, theme }) {
  const tints = createTintCache(createCanvas);
  const pieces = HERO_ATLAS[hero.id];
  const sheet = { images: {}, pieces, tints, ready: false, settled: false, theme };
  const names = stripsOf(hero);
  for (const name of names) {
    sheet.images[name] = createImage();
  }
  watchStrips(sheet, Object.values(sheet.images));
  for (const name of names) {
    sheet.images[name].src = `${baseUrl}${packedStripPath(hero, name)}`;
  }
  return sheet;
}

// a hero whose sword reaches higher than the Shades' frames has taller ones, and the feet keep the
// same gap above the frame's bottom edge
export function frameBox(sheet, name) {
  const { frameHeight, feetY } = HERO_SPRITES;
  const height = sheet.pieces[name][0];
  return { frameHeight: height, feetY: height - (frameHeight - feetY) };
}

function drawPiece(context, source, { piece, box, x, y, facing }) {
  const { feetX, scale } = HERO_SPRITES;
  const [, , width, height, left, top] = piece;
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
    width,
    height,
    (left - feetX) * scale,
    (top - box.feetY) * scale,
    width * scale,
    height * scale,
  );
  context.restore();
}

export function drawHeroFrame(
  painter,
  sheet,
  { frame: [name, index], x, y, facing, tint, relief, row },
) {
  // a strip still on its way draws nothing, and one that failed would throw
  if (!sheet.ready) {
    return;
  }
  const sourceRow = ONE_ROW_STRIPS.has(name) ? 0 : row || 0;
  const piece = sheet.pieces[name][1 + sourceRow]?.[index];
  if (!piece) {
    return;
  }
  const [sx, sy, width, height] = piece;
  const source = frameSource(sheet.tints, {
    image: sheet.images[name],
    key: name,
    color: tint,
    relief,
    sx,
    sy,
    width,
    height,
  });
  drawPiece(painter.context, source, { piece, box: frameBox(sheet, name), x, y, facing });
}
