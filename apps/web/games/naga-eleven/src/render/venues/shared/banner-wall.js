import { hash2 } from '../kit/hash.js';
import { rect } from '../kit/raster.js';
import { LETTER_HEIGHT, paintWord, wordWidth } from '../kit/tiny-font.js';

// a low wall round the pitch, painted in two colours with a light top, and the fans' banners hung
// along it on strings, sagging a pixel in the middle
const WALL = 11;
const CLOTH = 16;
const LETTERS = 2;

function paintBanner(raster, { x, top, banner }) {
  const width = wordWidth(banner.text, LETTERS) + 14;

  rect(raster, { x, y: top, width, height: CLOTH }, banner.back);
  rect(raster, { x: x + 3, y: top + CLOTH, width: width - 6, height: 1 }, banner.back);
  rect(raster, { x, y: top - 1, width, height: 2 }, banner.ink);
  paintWord(raster, banner.text, {
    x: x + 7,
    y: top + Math.floor((CLOTH - LETTER_HEIGHT * LETTERS) / 2) + 1,
    colour: banner.ink,
    scale: LETTERS,
  });

  return width;
}

export function paintBannerWall(raster, { art }) {
  const top = raster.height - WALL;

  rect(raster, { x: 0, y: top, width: raster.width, height: WALL }, art.wall[1]);
  rect(raster, { x: 0, y: top, width: raster.width, height: 2 }, art.wall[3]);
  rect(raster, { x: 0, y: raster.height - 1, width: raster.width, height: 1 }, art.wall[0]);

  let last = -1;

  for (let x = 30; art.banners.length > 0 && x < raster.width - 160; x += 0) {
    last = nextBanner(art.banners.length, last, hash2(x, 0, 99));
    x +=
      paintBanner(raster, { x, top: top - 9, banner: art.banners[last] }) +
      60 +
      Math.round(hash2(x, 1, 99) * 140);
  }
}

// a random pick among the banners, never the one just hung, so no two neighbours are twins
export function nextBanner(count, last, roll) {
  if (count < 2 || last < 0) {
    return Math.floor(roll * count);
  }

  const pick = Math.floor(roll * (count - 1));

  return pick >= last ? pick + 1 : pick;
}
