import { mixes } from '../dither.js';
import { hash } from '../hash.js';
import { paintFigure } from '../parts/figures.js';
import { litAt } from '../parts/light.js';
import { paintSugarPalm } from '../parts/palms.js';
import { fillRect, hline, plot, vline } from '../raster.js';
import { polygon } from '../shapes.js';

// the things of Sochetra's home: the window on the rain, the family photo, the krama on its
// nail, the woven mat

export const WINDOW = { x: 238, y: 34, width: 76, height: 70 };

export function paintNightWindow(raster, { art, wood }) {
  const { x, y, width, height } = WINDOW;

  for (let row = 0; row < height; row += 1) {
    hline(
      raster,
      { x, y: y + row, length: width },
      art.night[Math.min(3, Math.floor((row / height) * 3.6))],
    );
  }

  const palm = {
    trunk: [art.night[0], art.night[1]],
    leaf: [art.night[0], art.night[0], art.night[1]],
    dead: [art.night[0], art.night[1]],
  };

  paintSugarPalm(raster, {
    x: x + 52,
    base: y + height,
    height: 54,
    crown: 9,
    colors: palm,
    seed: 3,
  });
  fillRect(raster, { x: x - 3, y: y - 3, width: width + 6, height: 3 }, wood[2]);
  fillRect(raster, { x: x - 5, y: y + height, width: width + 10, height: 3 }, wood[3]);
  [x - 3, x + width].forEach((frameX) =>
    fillRect(raster, { x: frameX, y, width: 3, height }, wood[2]),
  );
  vline(raster, { x: x + width / 2, y, length: height }, wood[1]);
  [
    [x - 18, x - 3],
    [x + width + 3, x + width + 18],
  ].forEach(([left, right]) => {
    fillRect(raster, { x: left, y: y - 1, width: right - left, height: height + 2 }, wood[3]);

    for (let board = left + 3; board < right; board += 4) {
      vline(raster, { x: board, y: y - 1, length: height + 2 }, wood[2]);
    }
  });
}

export function paintPhoto(raster, { x, y, art, wood }) {
  fillRect(raster, { x: x - 3, y: y - 3, width: 38, height: 30 }, wood[4]);
  fillRect(raster, { x: x - 2, y: y - 2, width: 36, height: 28 }, wood[2]);
  fillRect(raster, { x, y, width: 32, height: 24 }, art.photo[2]);
  [
    [7, 20, 'stand', true],
    [16, 22, 'stand', false],
    [25, 13, 'child', false],
  ].forEach(([at, height, pose, bun]) => {
    paintFigure(raster, {
      x: x + at,
      ground: y + 24,
      height,
      pose,
      bun,
      colors: [art.photo[1], art.photo[0]],
      toward: { x: 1, y: 0 },
    });
  });
  hline(raster, { x, y, length: 32 }, art.photo[1]);
  plot(raster, x + 16, y - 6, wood[1]);
  vline(raster, { x: x + 16, y: y - 5, length: 2 }, wood[5]);
}

export function paintKrama(raster, { x, y, art }) {
  for (let row = 0; row < 46; row += 1) {
    const sway = Math.round(Math.sin(row / 9) * 1.5);

    for (let column = 0; column < 9; column += 1) {
      const check = (Math.floor(column / 2) + Math.floor(row / 2)) % 2 === 0;
      const stripe = row % 12 < 2;

      plot(raster, x + column + sway, y + row, stripe || check ? art.krama[1] : art.krama[0]);
    }
  }

  for (let column = 0; column < 9; column += 2) {
    vline(
      raster,
      { x: x + column + 1, y: y + 46, length: 2 + Math.floor(hash(column) * 2) },
      art.krama[1],
    );
  }
}

// the mat on the floor, its stripes running away toward the wall
export function paintMat(raster, { art, wood, light }) {
  const near = { left: 52, right: 340, y: 216 };
  const far = { left: 108, right: 290, y: 156 };

  polygon(
    raster,
    [far.left, far.y, far.right, far.y, near.right, near.y, near.left, near.y],
    art.mat[2],
  );

  for (let y = far.y; y < near.y; y += 1) {
    const along = (y - far.y) / (near.y - far.y);
    const left = Math.round(far.left + (near.left - far.left) * along);
    const right = Math.round(far.right + (near.right - far.right) * along);

    for (let x = left; x < right; x += 1) {
      const band = Math.floor(((x - left) / (right - left)) * 14);
      const color = [art.mat[0], art.mat[2], art.mat[1], art.mat[2]][band % 4];

      const shaded = !mixes(x, y, litAt({ x, y }, light) * 2.4 - 0.3);

      plot(raster, x, y, shaded || (x + y) % 3 === 0 ? wood[shaded ? 2 : 3] : color);
    }
  }
}
