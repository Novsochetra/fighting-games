import { hash } from '../hash.js';
import { fillRect, hline, plot, vline } from '../raster.js';
import { polygon } from '../shapes.js';

// A Cambodian school block: a long row of classrooms behind a veranda of square columns, the
// doors and shutters painted, a hipped tile roof; a bigger school stacks storeys with a railed
// walkway. `colors` = { wall, trim: [shade, lit], door: [dark, base, lit], roof, shadow }.

const STOREY = 26;
const PLINTH = 3;

function paintOpening(raster, { x, floor, door, colors }) {
  if (door) {
    fillRect(raster, { x: x - 4, y: floor - 16, width: 9, height: 16 }, colors.door[1]);
    fillRect(raster, { x: x - 3, y: floor - 15, width: 3, height: 15 }, colors.door[0]);
    vline(raster, { x: x + 3, y: floor - 15, length: 15 }, colors.door[2]);

    return;
  }

  fillRect(raster, { x: x - 6, y: floor - 17, width: 13, height: 10 }, colors.trim[1]);
  fillRect(raster, { x: x - 5, y: floor - 16, width: 11, height: 8 }, colors.door[0]);

  for (let slat = floor - 15; slat < floor - 8; slat += 2) {
    hline(raster, { x: x - 5, y: slat, length: 4 }, colors.door[2]);
    hline(raster, { x: x + 2, y: slat, length: 4 }, colors.door[1]);
  }
}

function paintStorey(raster, { x, width, floor, bay, colors, railed }) {
  const top = floor - STOREY;

  fillRect(raster, { x, y: top, width, height: STOREY }, colors.wall[2]);
  fillRect(raster, { x, y: top, width, height: 4 }, colors.wall[0]);
  hline(raster, { x, y: floor - 1, length: width }, colors.wall[1]);

  for (let column = x; column <= x + width - 3; column += bay) {
    fillRect(raster, { x: column, y: top + 2, width: 3, height: STOREY - 2 }, colors.trim[1]);
    vline(raster, { x: column + 2, y: top + 4, length: STOREY - 4 }, colors.trim[0]);

    if (column + bay < x + width) {
      paintOpening(raster, {
        x: column + Math.round(bay / 2) + 1,
        floor,
        door: hash(column, floor) > 0.6,
        colors,
      });
    }
  }

  if (railed) {
    for (let post = x; post < x + width; post += 2) {
      vline(raster, { x: post, y: floor - 6, length: 6 }, colors.trim[1]);
    }

    hline(raster, { x, y: floor - 7, length: width }, colors.trim[1]);
    hline(raster, { x, y: floor - 6, length: width }, colors.trim[0]);
  }
}

function paintTileRows(raster, { x, eave, rise, ends, color }) {
  const overhang = ends[0] - x + 8;

  for (let row = eave - rise + 3; row < eave; row += 3) {
    const along = (row - (eave - rise)) / rise;
    const left = Math.round(ends[0] - overhang * along);

    hline(
      raster,
      { x: left, y: row, length: Math.round(ends[1] - ends[0] + overhang * 2 * along) },
      color,
    );
  }
}

function paintHipRoof(raster, { x, width, eave, colors }) {
  const rise = 18;
  const ends = [x + 34, x + width - 34];
  const [left, right, ridge] = [x - 8, x + width + 8, eave - rise];
  const roof = colors.roof;

  polygon(raster, [left, eave, right, eave, ends[1], ridge, ends[0], ridge], roof[2]);
  paintTileRows(raster, { x, eave, rise, ends, color: roof[1] });
  polygon(raster, [left, eave, ends[0], ridge, ends[0] + 2, ridge, x - 2, eave], roof[3]);
  polygon(raster, [right, eave, ends[1], ridge, ends[1] - 2, ridge, x + width + 2, eave], roof[0]);
  hline(raster, { x: ends[0], y: ridge, length: ends[1] - ends[0] }, roof[3]);
  hline(raster, { x: left, y: eave, length: width + 16 }, roof[0]);
  hline(raster, { x: x - 6, y: eave + 1, length: width + 12 }, colors.shadow);
}

// a name board over the middle door, in letters too small to read
export function paintNameBoard(raster, { x, y, width, colors }) {
  fillRect(raster, { x, y, width, height: 8 }, colors.door[1]);
  fillRect(raster, { x: x + 1, y: y + 1, width: width - 2, height: 6 }, colors.trim[1]);

  for (let letter = x + 4; letter < x + width - 4; letter += 1) {
    if (hash(letter, y) > 0.45) {
      plot(raster, letter, y + 3 + Math.floor(hash(letter, 2) * 2), colors.door[0]);
    }
  }
}

export function paintSchoolhouse(raster, { x, ground, width, storeys = 1, bay = 22, colors }) {
  fillRect(
    raster,
    { x: x - 3, y: ground - PLINTH, width: width + 6, height: PLINTH },
    colors.trim[0],
  );
  hline(raster, { x: x - 3, y: ground - PLINTH, length: width + 6 }, colors.trim[1]);

  for (let storey = 0; storey < storeys; storey += 1) {
    const floor = ground - PLINTH - storey * STOREY;

    paintStorey(raster, { x, width, floor, bay, colors, railed: storey > 0 });
  }

  paintHipRoof(raster, { x, width, eave: ground - PLINTH - storeys * STOREY, colors });
}
