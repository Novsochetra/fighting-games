import { SPRITE_KIT } from '../../art/sprite-kit.js';
import { documentCanvasFactory } from './canvas-factory.js';
import { coloursOf, paintBuffer } from './figure/draw-buffer.js';
import { drawnDirections, FIGURE_SPRITES } from './figure/figure-sprites.js';
import { figureFrame } from './figure/frames.js';
import { kickTimingOf } from './animation.js';
import { createMemory } from './memory.js';
import { colourMap, recolourImage } from './recolour.js';
import { withThrowPose } from './throw-pose.js';

// What the players are drawn from: the loaded sprites (loadSprites) recoloured from `sourceKit`
// (the sheets' own colours by part) to each look, or the block figure when there are none. Each
// sheet is painted once for a look and kept; with no canvas to paint on, the figure is drawn
// straight onto the frame instead
export function createActorArt({
  sprites = null,
  sourceKit = SPRITE_KIT,
  createCanvas = documentCanvasFactory(),
} = {}) {
  const sheets = sprites && withThrowPose(sprites, createCanvas);
  const manifest = sheets?.manifest ?? FIGURE_SPRITES;

  return {
    manifest,
    standHeight: standHeightOf(manifest),
    kick: kickTimingOf(manifest.animations),
    images: sheets?.images ?? null,
    sourceKit,
    createCanvas,
    sheets: new Map(),
    memory: createMemory(),
  };
}

// how tall a player stands in the sheets, for what floats over their head: a manifest may say,
// else the anchor's height in the frame is taken, less a little for the space over the hair
export const standHeightOf = (manifest) => manifest.standHeight ?? manifest.anchor.y - 3;

function bakeFigure(animation, look, createCanvas) {
  const { width, height } = FIGURE_SPRITES.frame;
  const { frames } = FIGURE_SPRITES.animations[animation];
  const drawn = drawnDirections(animation);
  const rows = Math.max(...drawn.map(({ row }) => row)) + 1;
  const canvas = createCanvas(frames * width, rows * height);
  const context = canvas.getContext('2d');
  const image = context.createImageData(canvas.width, canvas.height);
  const colours = coloursOf(look);

  for (const { direction, row } of drawn) {
    for (let frame = 0; frame < frames; frame += 1) {
      const at = { left: frame * width, top: row * height, colours };

      paintBuffer(image, figureFrame(animation, direction, frame), at);
    }
  }

  context.putImageData(image, 0, 0);

  return canvas;
}

function makeSheet(art, look, animation) {
  if (!art.createCanvas) {
    return art.images?.[animation] ?? null;
  }

  if (art.images) {
    return recolourImage(art.images[animation], colourMap(art.sourceKit, look), art.createCanvas);
  }

  return bakeFigure(animation, look, art.createCanvas);
}

// sheets are kept by look, then by animation, so finding one makes no new key a frame
export function sheetOf(art, look, animation) {
  let byAnimation = art.sheets.get(look.key);

  if (!byAnimation) {
    byAnimation = new Map();
    art.sheets.set(look.key, byAnimation);
  }

  if (!byAnimation.has(animation)) {
    byAnimation.set(animation, makeSheet(art, look, animation));
  }

  return byAnimation.get(animation);
}

export const sheetCount = (art) =>
  [...art.sheets.values()].reduce((sum, byAnimation) => sum + byAnimation.size, 0);

// paints every sheet a match's players will need before it starts, so none is painted mid-play
export function prepareSheets(art, looks) {
  const animations = Object.keys(art.manifest.animations);

  for (const look of looks) {
    for (const animation of animations) {
      sheetOf(art, look, animation);
    }
  }
}
