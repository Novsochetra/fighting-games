import { heroSheetFor } from '../fighters/hero-sheets.js';
import { drawCarved } from './carved.js';

const SOLID = 0.95;
// ticks it flashes as it is carved out of his image, and as it swings
const FLASH_TICKS = 3;

// it holds the follow-through of its cut, and swings the cut once more when the cuts land
export function carvingFrame(carving) {
  const [strip, strike, row] = carving.sprite;
  return [strip, carving.swungAt === null ? strike + 1 : strike, row];
}

function flashing(carving) {
  const swinging = carving.swungAt !== null && carving.time < carving.swungAt + FLASH_TICKS;
  return carving.time <= FLASH_TICKS || swinging;
}

export function drawCarvings(painter, { summons, view }) {
  for (const carving of summons) {
    if (carving.kind === 'carving') {
      const frame = carvingFrame(carving);
      const at = { frame, x: carving.x, y: carving.y, facing: carving.direction, row: frame[2] };
      const sheet = heroSheetFor(view, carving.hero);
      drawCarved(painter, sheet, { at, alpha: SOLID, flash: flashing(carving) });
    }
  }
}
