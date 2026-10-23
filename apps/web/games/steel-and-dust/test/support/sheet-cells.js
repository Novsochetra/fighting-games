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

const NEIGHBOURS = [-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => [dx, dy]));

function floodBox(cell, start, joins) {
  const box = { left: start.x, right: start.x, top: start.y, bottom: start.y, count: 0 };
  const stack = [start];
  while (stack.length > 0) {
    const { x, y } = stack.pop();
    box.count++;
    Object.assign(box, {
      left: Math.min(box.left, x),
      right: Math.max(box.right, x),
      top: Math.min(box.top, y),
      bottom: Math.max(box.bottom, y),
    });
    stack.push(...NEIGHBOURS.map(([dx, dy]) => ({ x: x + dx, y: y + dy })).filter(joins));
  }
  return box;
}

// the box and size of each separate patch of a frame whose pixels pass a test of their color
export function blobsOf(image, cell, passes) {
  const taken = new Set();
  const joins = ({ x, y }) => {
    const inside = x >= 0 && y >= 0 && x < cell.width && y < cell.height;
    const key = y * cell.width + x;
    const fits = inside && !taken.has(key) && image.alpha(cell.left + x, cell.top + y) > 0;
    const join = fits && passes(image.rgb(cell.left + x, cell.top + y));
    return join && taken.add(key);
  };
  const blobs = [];
  for (let y = 0; y < cell.height; y++) {
    for (let x = 0; x < cell.width; x++) {
      if (joins({ x, y })) {
        blobs.push(floodBox(cell, { x, y }, joins));
      }
    }
  }
  return blobs;
}

function rowDrawn(image, cell, y) {
  for (let x = 0; x < cell.width; x++) {
    if (image.alpha(cell.left + x, cell.top + y) > 0) {
      return true;
    }
  }
  return false;
}
