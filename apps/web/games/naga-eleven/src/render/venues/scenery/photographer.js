import {
  PHOTOGRAPHER_COLOURS,
  PHOTOGRAPHER_FLASH,
  PHOTOGRAPHER_ROWS,
} from '../../../art/venues/photographer.js';
import { packAll } from '../kit/colour.js';
import { plot } from '../kit/raster.js';

// a photographer kneeling by the goal line behind a long lens, facing right toward the pitch; the
// second drawing fires the flash
export const PHOTOGRAPHER_SIZE = {
  width: PHOTOGRAPHER_ROWS[0].length,
  height: PHOTOGRAPHER_ROWS.length,
};

const colours = packAll(PHOTOGRAPHER_COLOURS);

function paintRows(raster, { rows, x = 0, y = 0 }) {
  rows.forEach((row, dy) => {
    [...row].forEach((letter, dx) => {
      if (colours[letter] !== undefined) {
        plot(raster, x + dx, y + dy, colours[letter]);
      }
    });
  });
}

// the colours are the photographer's own, the same at every venue
export function paintPhotographer(raster, index) {
  paintRows(raster, { rows: PHOTOGRAPHER_ROWS });

  if (index === 1) {
    paintRows(raster, PHOTOGRAPHER_FLASH);
  }
}
