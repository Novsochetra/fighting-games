import { packed } from '../../../../../../src/render/venues/kit/colour.js';
import { NAGA_ART, SHOT_ART } from '../../colors.js';

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// the order the pixels of a 4x4 cell light in, so any share of them lit reads as an even tone
export const thresholdAt = (x, y) => (BAYER[y & 3][x & 3] + 0.5) / 16;

// a light seen through `level` (0 to 1) of its pixels, in eight steps, never a blend
export const ditherLevel = (share) => Math.round(Math.min(1, Math.max(0, share)) * 8) / 8;

export const ENERGY = {
  ink: packed(SHOT_ART.ink),
  emerald: SHOT_ART.emerald.map(packed),
  gold: SHOT_ART.gold.map(packed),
  eye: NAGA_ART.eye.map(packed),
  ember: SHOT_ART.ember.map(packed),
  flash: packed(SHOT_ART.flash),
  white: packed(SHOT_ART.white),
};

export const ENERGY_HEX = {
  emerald: SHOT_ART.emerald,
  gold: SHOT_ART.gold,
  eye: NAGA_ART.eye,
  ember: SHOT_ART.ember,
  flash: SHOT_ART.flash,
  white: SHOT_ART.white,
};

// `keeps(x, y, index)` takes the world's x and y and the sheet's index
export function maskedPen(sheet, keeps) {
  const { raster, offset } = sheet;

  function rect([left, top, width, height], color) {
    const fromX = Math.max(0, Math.round(left) + offset.x);
    const fromY = Math.max(0, Math.round(top) + offset.y);
    const toX = Math.min(raster.width, Math.round(left + width) + offset.x);
    const toY = Math.min(raster.height, Math.round(top + height) + offset.y);
    const colour = typeof color === 'string' ? packed(color) : color;

    for (let row = fromY; row < toY; row += 1) {
      for (let column = fromX; column < toX; column += 1) {
        const index = row * raster.width + column;

        if (keeps(column - offset.x, row - offset.y, index)) {
          raster.pixels[index] = colour;
        }
      }
    }

    if (toX > fromX && toY > fromY) {
      sheet.cover({ left: fromX, top: fromY, right: toX, bottom: toY });
    }
  }

  return { ...sheet, rect, dot: (x, y, color) => rect([x, y, 1, 1], color) };
}

export const ditheredPen = (sheet, level) =>
  level >= 1 ? sheet : maskedPen(sheet, (x, y) => thresholdAt(x, y) < level);

// paints only where nothing is yet, so what is drawn after lies behind what was drawn before
export const underPen = (sheet) =>
  maskedPen(sheet, (x, y, index) => sheet.raster.pixels[index] === 0);

// for packed colours, which a pen's rect does not take
export function pixelWriter(sheet) {
  const { raster, offset } = sheet;
  const box = { left: raster.width, top: raster.height, right: 0, bottom: 0 };

  return {
    plot(x, y, word) {
      const column = Math.round(x) + offset.x;
      const row = Math.round(y) + offset.y;

      if (column < 0 || row < 0 || column >= raster.width || row >= raster.height) {
        return;
      }

      raster.pixels[row * raster.width + column] = word;
      box.left = Math.min(box.left, column);
      box.top = Math.min(box.top, row);
      box.right = Math.max(box.right, column + 1);
      box.bottom = Math.max(box.bottom, row + 1);
    },

    done() {
      if (box.right > box.left) {
        sheet.cover(box);
      }
    },
  };
}
