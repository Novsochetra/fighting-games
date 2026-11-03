import { DIRECTIONS, rowFor } from './directions.js';
import { cellOf, shirtMaskOf } from './shirt-mask.js';
import { maskAt, rowAnchors } from './torso-anchor.js';

// the animations a player stands up in; a slide, a fall and a dive lay the shirt flat and twisted,
// where no number would read
const NUMBERED = ['idle', 'run', 'kick', 'throw', 'celebrate'];

function sideOf(drawn) {
  if (drawn.startsWith('north')) {
    return 'back';
  }

  return drawn.startsWith('south') ? 'chest' : null;
}

// each row and mirroring of an animation some way is drawn with, and the side of him it shows
function waysOf(animation) {
  const ways = new Map();

  for (const direction of DIRECTIONS) {
    const { row, mirror, drawn } = rowFor(animation.rows, direction);
    const side = sideOf(drawn);

    if (side && !ways.has(`${row}:${mirror}`)) {
      ways.set(`${row}:${mirror}`, { row, mirror, side });
    }
  }

  return [...ways.values()];
}

// the frames' clips are kept once each, as most are the whole box; a frame names its clip by index
function variantOf(variants, { mask, side }) {
  const key = `${side}:${mask.join('')}`;
  const known = variants.keys.get(key);

  if (known !== undefined) {
    return known;
  }

  variants.keys.set(key, variants.masks.length);
  variants.masks.push({ mask, side });

  return variants.masks.length - 1;
}

function animationAnchors(mask, animation, { frame, variants }) {
  const byRow = [];

  for (const { row, mirror, side } of waysOf(animation)) {
    const cells = Array.from({ length: animation.frames }, (_, i) =>
      cellOf(mask, { left: i * frame.width, top: row * frame.height, ...frame, mirror }),
    );
    const anchors = rowAnchors(cells, side);

    byRow[row] ??= [null, null];
    byRow[row][mirror ? 1 : 0] = anchors.map(
      (anchor, i) =>
        anchor && {
          ...anchor,
          variant: variantOf(variants, { mask: maskAt(cells[i], anchor), side }),
        },
    );
  }

  return byRow;
}

function findAnchors(art) {
  const { manifest, images, createCanvas, sourceKit } = art;
  const variants = { keys: new Map(), masks: [] };
  const byAnimation = {};

  for (const name of NUMBERED.filter((each) => manifest.animations[each] && images[each])) {
    const animation = manifest.animations[name];
    const mask = shirtMaskOf(images[name], { createCanvas, shirt: sourceKit.shirt });
    const frame = animation.frame ?? manifest.frame;

    byAnimation[name] = animationAnchors(mask, animation, { frame, variants });
  }

  return { byAnimation, variants: variants.masks };
}

// where a number goes on every frame of the sheets, found once from their shirt pixels; null for
// art with no sheets to read or no canvas to read them on
export function numberAnchorsOf(art) {
  if (art.numberAnchors === undefined) {
    art.numberAnchors = art.images && art.createCanvas ? findAnchors(art) : null;
  }

  return art.numberAnchors;
}

// the number's box on one frame: its top left in the frame and the index of its clip, or null
export function anchorFor(anchors, { name, row, mirror, frame }) {
  return anchors?.byAnimation[name]?.[row]?.[mirror ? 1 : 0]?.[frame] ?? null;
}
