import { GROUND } from '../../world.js';
import { ditherLevel, ENERGY_HEX, maskedPen, thresholdAt } from './pixels.js';

// how high its light still reaches the grass, in pixels
const REACH = 150;

const ROWS = [
  { down: 1, color: ENERGY_HEX.emerald[4], share: 0.5 },
  { down: 2, color: ENERGY_HEX.emerald[3], share: 0.8 },
  { down: 3, color: ENERGY_HEX.emerald[2], share: 0.6 },
];

// A strip of its light on the grass along the line he stands on, under each part of it, brighter
// the lower it flies, seen through a dither so the grass shows through; it swims with the body.
function drawUnder(sheet, { x, y, half }) {
  const level = 0.55 * (1 - (GROUND - y) / REACH);

  if (level <= 0) {
    return;
  }

  ROWS.forEach(({ down, color, share }) => {
    const shown = ditherLevel(level * share);
    const pen = maskedPen(
      sheet,
      (px, py, index) => thresholdAt(px, py) < shown && sheet.raster.pixels[index] === 0,
    );

    pen.rect([x - half, GROUND + down, half * 2, 1], color);
  });
}

export function drawSheen(sheet, { frames, place }) {
  frames.forEach((at, i) => {
    if (i % 2 === 0) {
      drawUnder(sheet, { x: at.x, y: at.y, half: at.radius + 2 });
    }
  });
  drawUnder(sheet, { x: place.x + 2 * place.size, y: place.y, half: 14 * place.size });
}
