import { fillRect, hline, plot } from '../raster.js';

// A team shirt on its hook: the body, the sleeves, a collar of the trim colour and the number
// in small block digits. `colors` = { shade, base, lit, trim, number }

const DIGITS = {
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'],
  3: ['111', '001', '011', '001', '111'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'],
  7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'],
  9: ['111', '101', '111', '001', '111'],
};

export function paintNumber(raster, { x, y, number, color }) {
  [...String(number)].forEach((digit, i) => {
    DIGITS[digit].forEach((row, line) => {
      [...row].forEach((bit, column) => {
        if (bit === '1') {
          plot(raster, x + i * 4 + column, y + line, color);
        }
      });
    });
  });
}

// `x` is the hook, the shirt hangs below it
export function paintShirt(raster, { x, y, number, colors }) {
  plot(raster, x, y, colors.trim);
  fillRect(raster, { x: x - 8, y: y + 2, width: 17, height: 5 }, colors.base);
  fillRect(raster, { x: x - 5, y: y + 2, width: 11, height: 17 }, colors.base);
  hline(raster, { x: x - 8, y: y + 2, length: 17 }, colors.lit);
  fillRect(raster, { x: x - 8, y: y + 5, width: 3, height: 2 }, colors.trim);
  fillRect(raster, { x: x + 6, y: y + 5, width: 3, height: 2 }, colors.trim);
  fillRect(raster, { x: x + 3, y: y + 3, width: 3, height: 16 }, colors.shade);
  hline(raster, { x: x - 2, y: y + 2, length: 5 }, colors.trim);
  plot(raster, x, y + 3, colors.trim);
  paintNumber(raster, {
    x: x - String(number).length * 2 + 1,
    y: y + 8,
    number,
    color: colors.number,
  });
}
