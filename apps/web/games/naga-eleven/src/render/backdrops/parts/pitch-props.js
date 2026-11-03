import { mixes } from '../dither.js';
import { hash, patchNoise } from '../hash.js';
import { artRect } from '../pen.js';
import { fillRect, hline, plot, vline } from '../raster.js';

// a bamboo goal: two posts and a bar lashed at the corners, the nodes marked; `colors` [shade,
// base, lit]
export function paintBambooGoal(raster, { x, ground, width, height, colors }) {
  [x, x + width - 2].forEach((postX) => {
    fillRect(raster, { x: postX, y: ground - height, width: 2, height }, colors[1]);
    vline(raster, { x: postX, y: ground - height, length: height }, colors[2]);

    for (let node = ground - height + 5; node < ground; node += 6) {
      hline(raster, { x: postX, y: node, length: 2 }, colors[0]);
    }
  });
  fillRect(raster, { x: x - 1, y: ground - height, width: width + 2, height: 2 }, colors[1]);
  hline(raster, { x: x - 1, y: ground - height, length: width + 2 }, colors[2]);

  for (let node = x + 6; node < x + width; node += 7) {
    vline(raster, { x: node, y: ground - height, length: 2 }, colors[0]);
  }
}

// a net hung behind a goal mouth: a loose diamond mesh, see-through
export function paintNet(raster, { x, y, width, height, color }) {
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      if ((column + row) % 4 === 0 || (column - row + 400) % 4 === 0) {
        plot(raster, x + column, y + row, color);
      }
    }
  }
}

// a flagpole with a ball on top; the flag itself waves in `drawFlag`
export function paintFlagpole(raster, { x, ground, height, colors }) {
  vline(raster, { x, y: ground - height, length: height }, colors[1]);
  vline(raster, { x: x + 1, y: ground - height, length: height }, colors[0]);
  fillRect(raster, { x: x - 1, y: ground - height - 2, width: 3, height: 2 }, colors[1]);
  fillRect(raster, { x: x - 3, y: ground - 3, width: 8, height: 3 }, colors[0]);
}

// three bands, blue, red and blue, with the white of a temple in the red, rippling in the wind
const FLAG_ROWS = [
  'bbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbb',
  'rrrrrrrrrrrrrrrrrr',
  'rrrrrrrrwrrrrrrrrr',
  'rrrrrrwrwrwrrrrrrr',
  'rrrrrwwwwwwwrrrrrr',
  'rrrrwwwwwwwwwrrrrr',
  'rrrrrrrrrrrrrrrrrr',
  'bbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbb',
];

export function drawFlag(context, { x, y, colors, tick }) {
  const keys = { b: colors[0], r: colors[1], w: colors[2] };

  for (let column = 0; column < FLAG_ROWS[0].length; column += 1) {
    const wave = Math.round(Math.sin(column * 0.55 - tick * 0.12) * (column / 9));

    FLAG_ROWS.forEach((row, line) =>
      artRect(context, { x: x + column, y: y + line + wave }, keys[row[column]]),
    );
  }
}

// bare red earth with worn grass along its edges and specks of grit; `colors.earth` and
// `colors.green` dark to light
export function paintYard(raster, { top, bottom, colors, seed = 1, bare = 0.42 }) {
  for (let y = top; y < bottom; y += 1) {
    const depth = (y - top) / (bottom - top);

    for (let x = 0; x < raster.width; x += 1) {
      const worn = 1 - Math.abs(x - raster.width / 2) / (raster.width / 2);
      const grass = patchNoise(seed, { x, y: y * 2.5 }, 22) - worn * 0.35 > bare;
      const ramp = grass ? colors.green : colors.earth;
      const speck = hash(seed, x, y) > 0.95;

      plot(raster, x, y, ramp[speck ? 0 : 1 + Number(mixes(x, y, 0.55 - depth * 0.4))]);
    }
  }
}

// a small desk flag on its stand; `colors` [blue, red, white]
export function paintFlagStand(raster, { x, ground, colors, pole }) {
  vline(raster, { x, y: ground - 22, length: 22 }, pole);
  fillRect(raster, { x: x - 3, y: ground - 2, width: 7, height: 2 }, pole);
  fillRect(raster, { x: x + 1, y: ground - 22, width: 11, height: 8 }, colors[0]);
  fillRect(raster, { x: x + 1, y: ground - 20, width: 11, height: 4 }, colors[1]);
  hline(raster, { x: x + 5, y: ground - 18, length: 3 }, colors[2]);
  plot(raster, x + 6, ground - 19, colors[2]);
}
