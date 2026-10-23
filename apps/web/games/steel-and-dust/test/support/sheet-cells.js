import { ENEMY_SPRITES } from '../../src/data/enemies/enemy-sprites.js';
import { readPngAlpha } from './png-alpha.js';

const GAME = new URL('../../', import.meta.url);

// an enemy's sheet and the box of each of its frames, in sheet pixels
export function readSheet(kind) {
  const sprite = ENEMY_SPRITES[kind];
  const image = readPngAlpha(new URL(`assets/sprites/enemies/${sprite.file}`, GAME));
  const cellOf = (strip, frame) => ({
    left: frame * sprite.frameWidth,
    top: sprite.strips[strip].row * sprite.frameHeight,
    width: sprite.frameWidth,
    height: sprite.frameHeight,
  });
  return { sprite, image, cellOf };
}

export function lowestRow(image, { left, top, width, height }) {
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      if (image.alpha(left + x, top + y) > 0) {
        return y;
      }
    }
  }
  return -1;
}

// the opaque pixels of a box inside a frame, as offsets from the box's corner and their colors
export function patchOf(image, cell, { x, y, width, height }) {
  const pixels = [];
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      if (image.alpha(cell.left + x + dx, cell.top + y + dy) > 0) {
        pixels.push({ dx, dy, rgb: image.rgb(cell.left + x + dx, cell.top + y + dy).join() });
      }
    }
  }
  return pixels;
}

function patchAt(image, cell, pixels, { x, y }) {
  return pixels.every(
    ({ dx, dy, rgb }) =>
      image.alpha(cell.left + x + dx, cell.top + y + dy) > 0 &&
      image.rgb(cell.left + x + dx, cell.top + y + dy).join() === rgb,
  );
}

// whether a frame draws the same pixels somewhere: the same piece of art, wherever it stands
export function drawsPatch(image, cell, pixels) {
  for (let y = 0; y < cell.height; y++) {
    for (let x = 0; x < cell.width; x++) {
      if (patchAt(image, cell, pixels, { x, y })) {
        return true;
      }
    }
  }
  return false;
}

// the middle, left to right, of the top rows a frame draws: where its head and shoulders are
export function headMiddle(image, cell, rows) {
  let top = 0;
  while (top < cell.height && !rowDrawn(image, cell, top)) {
    top++;
  }
  let sum = 0;
  let count = 0;
  for (let y = top; y < top + rows; y++) {
    for (let x = 0; x < cell.width; x++) {
      if (image.alpha(cell.left + x, cell.top + y) > 0) {
        sum += x;
        count++;
      }
    }
  }
  return sum / count;
}

function rowDrawn(image, cell, y) {
  for (let x = 0; x < cell.width; x++) {
    if (image.alpha(cell.left + x, cell.top + y) > 0) {
      return true;
    }
  }
  return false;
}
