import { ENERGY } from './pixels.js';

// A glow the pixel way, never a blur: a dark ring a pixel wide round all that is drawn, which
// keeps the silhouette whole over a bright crowd, then rings of every other and every third pixel
// of its light, whose pattern steps along every other frame, so the aura crackles. Burning at the
// keeper, the first of them closes up.
export const auraOf = ({ frame, burn = 0 }) => {
  const phase = Math.floor(frame / 2);

  return [
    { color: ENERGY.emerald[1], every: 1, phase },
    { color: ENERGY.emerald[3], every: burn > 0.5 ? 1 : 2, phase },
    { color: ENERGY.emerald[2], every: 3, phase },
  ];
};

const DARK_RING = [{ color: ENERGY.emerald[1], every: 1, phase: 0 }];

const touches = (pixels, index, width) =>
  pixels[index - 1] !== 0 ||
  pixels[index + 1] !== 0 ||
  pixels[index - width] !== 0 ||
  pixels[index + width] !== 0;

function ringRound(sheet, { color, every, phase }) {
  const { raster, box, left, top } = sheet;
  const { pixels, width } = raster;
  const found = [];
  const [fromX, toX] = [Math.max(1, box.left - 1), Math.min(width - 1, box.right + 1)];
  const [fromY, toY] = [Math.max(1, box.top - 1), Math.min(raster.height - 1, box.bottom + 1)];

  for (let row = fromY; row < toY; row += 1) {
    for (let column = fromX; column < toX; column += 1) {
      const index = row * width + column;
      const kept = every === 1 || (column + left + row + top + phase) % every === 0;

      if (kept && pixels[index] === 0 && touches(pixels, index, width)) {
        found.push(index);
      }
    }
  }

  found.forEach((index) => {
    pixels[index] = color;
  });
  sheet.cover({ left: fromX, top: fromY, right: toX, bottom: toY });
}

export function glowRound(sheet, rings = DARK_RING) {
  if (sheet.box.right <= sheet.box.left) {
    return;
  }

  rings.forEach((ring) => ringRound(sheet, ring));
}
