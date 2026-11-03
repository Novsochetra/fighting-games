import { hash } from '../hash.js';
import { paintFlagStand } from '../parts/pitch-props.js';
import { fillRect, hline, plot, vline } from '../raster.js';
import { disc } from '../shapes.js';

// the office's furniture: the shelves of files with a small cup on them, the desk with its lamp,
// a pen pot, the flag and the letter

export function paintShelves(raster, { x, y, art }) {
  fillRect(raster, { x, y, width: 92, height: 124 }, art.wood[1]);

  for (let shelf = y + 30; shelf <= y + 124; shelf += 30) {
    fillRect(raster, { x, y: shelf - 3, width: 92, height: 3 }, art.wood[3]);

    for (let file = x + 4; file < x + 86; file += 5) {
      const tall = 18 + Math.floor(hash(file, shelf) * 8);

      fillRect(
        raster,
        { x: file, y: shelf - 3 - tall, width: 4, height: tall },
        [art.seal, art.green[1], art.paper[0], art.towers[0][0]][
          Math.floor(hash(file, shelf, 2) * 4)
        ],
      );
      vline(raster, { x: file, y: shelf - 3 - tall, length: tall }, art.wood[2]);
    }
  }

  fillRect(raster, { x: x + 34, y: y + 4, width: 24, height: 23 }, art.wood[1]);
  disc(raster, { x: x + 46, y: y + 12, radius: 5 }, art.gold[1]);
  disc(raster, { x: x + 45, y: y + 11, radius: 2 }, art.gold[2]);
  fillRect(raster, { x: x + 44, y: y + 17, width: 4, height: 5 }, art.gold[0]);
  fillRect(raster, { x: x + 40, y: y + 22, width: 12, height: 3 }, art.gold[1]);
}

function paintLetter(raster, { art }) {
  fillRect(raster, { x: 202, y: 140, width: 26, height: 10 }, art.paper[0]);
  hline(raster, { x: 202, y: 140, length: 26 }, art.paper[1]);
  fillRect(raster, { x: 172, y: 134, width: 28, height: 16 }, art.paper[2]);
  hline(raster, { x: 172, y: 149, length: 28 }, art.paper[0]);

  for (let row = 137; row < 147; row += 2) {
    hline(raster, { x: 175, y: row, length: 14 + Math.floor(hash(row) * 8) }, art.paper[0]);
  }

  disc(raster, { x: 194, y: 145, radius: 2 }, art.seal);
  plot(raster, 193, 144, art.paper[2]);
}

export function paintDesk(raster, { art }) {
  fillRect(raster, { x: 30, y: 148, width: 324, height: 4 }, art.wood[4]);
  hline(raster, { x: 30, y: 148, length: 324 }, art.paper[1]);
  fillRect(raster, { x: 34, y: 152, width: 316, height: 64 }, art.wood[2]);
  hline(raster, { x: 34, y: 152, length: 316 }, art.wood[0]);
  paintLetter(raster, { art });
  fillRect(raster, { x: 92, y: 144, width: 14, height: 4 }, art.gold[0]);
  vline(raster, { x: 98, y: 128, length: 16 }, art.gold[1]);
  fillRect(raster, { x: 88, y: 122, width: 22, height: 7 }, art.green[1]);
  hline(raster, { x: 88, y: 122, length: 22 }, art.green[0]);
  fillRect(raster, { x: 130, y: 138, width: 8, height: 10 }, art.wood[0]);
  [131, 134, 136].forEach((pen, i) =>
    vline(raster, { x: pen, y: 133 + i, length: 5 }, [art.seal, art.paper[2], art.towers[0][0]][i]),
  );
  paintFlagStand(raster, {
    x: 290,
    ground: 148,
    colors: [art.towers[1][0], art.seal, art.paper[2]],
    pole: art.gold[1],
  });
}
