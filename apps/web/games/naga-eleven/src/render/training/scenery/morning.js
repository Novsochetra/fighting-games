import { CLOUD, HILLS, SKY, TREES, TRUNK, WALL } from '../../../art/training/ground.js';
import { ART_VIEW, dither, noise, oval, paint } from '../pixels.js';

// the training ground's morning: sky, clouds, far hills, the tree line and the school wall, each
// sliding past at its own share of the camera
const BAND = 12;
const TREE_GAP = 20;

export function drawSky(context) {
  SKY.forEach((color, i) => {
    paint(context, color, [0, i * BAND, ART_VIEW.width, i === SKY.length - 1 ? 60 : BAND]);

    if (i > 0) {
      dither(context, color, [0, i * BAND - 2, ART_VIEW.width, 2], i);
    }
  });
}

function drawCloud(context, { x, y, size }) {
  oval(context, CLOUD.shade, { x: x + 2, y: y + 2, radiusX: size * 3, radiusY: size });
  oval(context, CLOUD.mid, { x, y, radiusX: size * 3, radiusY: size });
  oval(context, CLOUD.light, { x: x - size, y: y - size + 1, radiusX: size * 1.6, radiusY: size });
  oval(context, CLOUD.light, { x: x + size, y: y - 1, radiusX: size * 1.4, radiusY: size - 1 });
  paint(context, CLOUD.shade, [x - size * 3, y + size - 1, size * 6, 1]);
}

export function drawClouds(context, { camera, tick }) {
  const span = ART_VIEW.width + 120;

  for (let i = 0; i < 4; i += 1) {
    const drift = i * 131 - camera * 0.05 - tick * 0.04;
    const x = (((drift % span) + span) % span) - 60;

    drawCloud(context, { x: Math.round(x), y: 10 + ((i * 7) % 18), size: 3 + (i % 2) });
  }
}

// two slow waves of hill, far and blue
export function drawHills(context, { camera, base }) {
  for (let column = 0; column < ART_VIEW.width; column += 2) {
    const along = column + camera * 0.1;
    const wave = Math.abs(((along / 90) % 2) - 1) * 9 + Math.abs(((along / 37) % 2) - 1) * 4;
    const top = Math.round(base - 20 + wave);

    paint(context, HILLS[0], [column, top, 2, base - top]);
    paint(context, HILLS[1], [column, top, 2, 1]);
  }
}

function drawTree(context, { x, base, size, seed }) {
  paint(context, TRUNK[0], [x - 1, base - 8, 3, 8]);
  paint(context, TRUNK[1], [x - 1, base - 8, 1, 8]);
  oval(context, TREES[0], { x, y: base - size - 6, radiusX: size + 1, radiusY: size });
  oval(context, TREES[1], { x: x - 1, y: base - size - 7, radiusX: size, radiusY: size - 1 });
  oval(context, TREES[2], { x: x - 2, y: base - size - 9, radiusX: size - 3, radiusY: size - 3 });
  oval(context, TREES[3], { x: x - 3, y: base - size - 11, radiusX: 2 + (seed % 2), radiusY: 2 });
}

export function drawTrees(context, { camera, base }) {
  const shift = camera * 0.3;
  const first = Math.floor(shift / TREE_GAP) - 1;

  for (let i = first; i < first + ART_VIEW.width / TREE_GAP + 3; i += 1) {
    const size = 8 + Math.floor(noise(i) * 7);

    drawTree(context, { x: Math.round(i * TREE_GAP - shift), base, size, seed: i });
  }
}

// the school's wall, capped with red tile, a pillar every few metres
export function drawWall(context, { camera, top, bottom }) {
  const shift = Math.round(camera * 0.6);

  paint(context, WALL.face, [0, top, ART_VIEW.width, bottom - top]);
  paint(context, WALL.shade, [0, top + 3, ART_VIEW.width, 2]);
  paint(context, WALL.roof[0], [0, top, ART_VIEW.width, 3]);
  paint(context, WALL.roof[2], [0, top, ART_VIEW.width, 1]);

  for (let x = -(shift % 64); x < ART_VIEW.width; x += 64) {
    paint(context, WALL.shade, [x + 6, top + 3, 5, bottom - top - 3]);
    paint(context, WALL.roof[1], [x + 5, top - 2, 7, 2]);
    paint(context, WALL.roof[2], [x + 5, top - 2, 7, 1]);
  }

  dither(context, WALL.shade, [0, bottom - 3, ART_VIEW.width, 3]);
}
