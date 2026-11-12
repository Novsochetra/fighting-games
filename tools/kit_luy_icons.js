// គិតលុយ's tab and app icons, drawn from the game's own pixel art.
//
//     node tools/kit_luy_icons.js [OUT_DIR]
//
// Draws the piggy bank under a riel coin, before the market's dusk sky, on a grid of 32 art
// pixels, and writes every size the game's page and manifest name to
// apps/web/games/kit-luy/assets/icons/ (or OUT_DIR). Run it again after the pig, the coin or the
// palette changes.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { COIN_FACE } from '../apps/web/games/kit-luy/src/art/coin.js';
import { COIN, PIGGY, SKY, SPARK } from '../apps/web/games/kit-luy/src/art/palette.js';
import { piggyRows } from '../apps/web/games/kit-luy/src/art/piggy.js';

const GRID = 32;
const OUT_DIR = path.join(import.meta.dirname, '../apps/web/games/kit-luy/assets/icons');
const SPARKLE = ['.s.', 'sss', '.s.'];

// where each piece stands on the grid: the coin hangs over the slot in the pig's back
const PIECES = [
  { rows: piggyRows('happy'), colors: PIGGY, x: 5, y: 12 },
  { rows: COIN_FACE, colors: COIN, x: 13, y: 3 },
  { rows: SPARKLE, colors: { s: SPARK }, x: 5, y: 5 },
  { rows: SPARKLE, colors: { s: SPARK }, x: 24, y: 7 },
];

// `unit` is how many pixels of the icon one art pixel takes. A grid smaller than the icon stands
// in its middle, the sky reaching the edges: Android crops a maskable icon to a circle of 80% of
// its width, and 180 is no whole multiple of 32.
const ICONS = [
  { file: 'icon-32.png', size: 32, unit: 1 },
  { file: 'icon-192.png', size: 192, unit: 6 },
  { file: 'icon-512.png', size: 512, unit: 16 },
  { file: 'icon-maskable-512.png', size: 512, unit: 10 },
  { file: 'apple-touch-icon.png', size: 180, unit: 5 },
];

const rgb = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

function paintSky(pixels, size) {
  for (let y = 0; y < size; y++) {
    const color = rgb(SKY[Math.floor((y * SKY.length) / size)]);

    for (let x = 0; x < size; x++) {
      pixels.set([...color, 255], (y * size + x) * 4);
    }
  }
}

function paintBlock(pixels, { size, unit }, { x, y, color }) {
  for (let dy = 0; dy < unit; dy++) {
    for (let dx = 0; dx < unit; dx++) {
      pixels.set([...rgb(color), 255], ((y + dy) * size + x + dx) * 4);
    }
  }
}

function paintPiece(pixels, icon, piece) {
  const origin = (icon.size - GRID * icon.unit) / 2;

  piece.rows.forEach((row, rowIndex) => {
    [...row].forEach((letter, column) => {
      if (piece.colors[letter]) {
        paintBlock(pixels, icon, {
          x: origin + (piece.x + column) * icon.unit,
          y: origin + (piece.y + rowIndex) * icon.unit,
          color: piece.colors[letter],
        });
      }
    });
  });
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const frame = Buffer.alloc(body.length + 8);

  frame.writeUInt32BE(data.length, 0);
  body.copy(frame, 4);
  frame.writeUInt32BE(crc32(body), body.length + 4);

  return frame;
}

function png(pixels, size) {
  const header = Buffer.alloc(13);
  const rows = Buffer.alloc((size * 4 + 1) * size);

  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);

  for (let y = 0; y < size; y++) {
    Buffer.from(pixels.buffer, y * size * 4, size * 4).copy(rows, y * (size * 4 + 1) + 1);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export function drawIcon(icon) {
  const pixels = new Uint8Array(icon.size * icon.size * 4);

  paintSky(pixels, icon.size);
  PIECES.forEach((piece) => paintPiece(pixels, icon, piece));

  return png(pixels, icon.size);
}

function main(outDir) {
  mkdirSync(outDir, { recursive: true });

  for (const icon of ICONS) {
    writeFileSync(path.join(outDir, icon.file), drawIcon(icon));
    console.log(`${icon.file}  ${icon.size}x${icon.size}`);
  }
}

if (process.argv[1] === import.meta.filename) {
  main(process.argv[2] ?? OUT_DIR);
}
