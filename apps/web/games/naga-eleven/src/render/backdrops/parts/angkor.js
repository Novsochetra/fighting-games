import { fillRect, hline, plot } from '../raster.js';
import { polygon } from '../shapes.js';
import { paintPrang } from './prang.js';

// Angkor Wat seen from the west across its moat: the long outer gallery, two terraces climbing
// to the middle and the five towers, the tallest at the centre, shaped like lotus buds. A
// silhouette against the sky; `colors` = [shade, base, rim, line], the rim toward `light`.

const LEVELS = [
  { half: 120, rise: 9 },
  { half: 74, rise: 11 },
  { half: 44, rise: 11 },
];

const TOWERS = [
  { at: 0, width: 26, height: 64, level: 3 },
  { at: -31, width: 18, height: 42, level: 2.6 },
  { at: 31, width: 18, height: 42, level: 2.6 },
  { at: -60, width: 15, height: 30, level: 2 },
  { at: 60, width: 15, height: 30, level: 2 },
];

function paintGallery(raster, { x, top, half, rise, colors, light }) {
  fillRect(raster, { x: x - half, y: top, width: half * 2, height: rise }, colors[1]);
  hline(raster, { x: x - half - 2, y: top, length: half * 2 + 4 }, colors[0]);

  for (let pediment = x - half + 6; pediment < x + half - 4; pediment += 12) {
    polygon(raster, [pediment - 3, top + 1, pediment, top - 3, pediment + 3, top + 1], colors[1]);
  }

  for (let column = x - half + 2; column < x + half; column += 3) {
    plot(raster, column, top + rise - 3, colors[3]);
    plot(raster, column, top + rise - 2, colors[3]);
  }

  plot(raster, light > 0 ? x + half - 1 : x - half, top, colors[2]);
}

function levelTop(base, level) {
  let top = base;

  for (let i = 0; i < Math.floor(level); i += 1) {
    top -= LEVELS[i].rise;
  }

  return top - (level % 1) * LEVELS[Math.min(2, Math.floor(level))].rise;
}

export function paintAngkorWat(raster, { x, base, colors, light = 1 }) {
  LEVELS.forEach((level, i) => {
    paintGallery(raster, { x, top: levelTop(base, i + 1), ...level, colors, light });
  });
  [...TOWERS].reverse().forEach((tower) => {
    paintPrang(raster, {
      x: x + tower.at,
      base: Math.round(levelTop(base, tower.level)) + 1,
      width: tower.width,
      height: tower.height,
      colors,
      light,
      rimOnly: true,
    });
  });
  polygon(
    raster,
    [x - 6, base, x - 3, levelTop(base, 3), x + 3, levelTop(base, 3), x + 6, base],
    colors[0],
  );
}
