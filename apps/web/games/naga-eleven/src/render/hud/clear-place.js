import { VIEW } from '../../config.js';
import { hudBoxes } from './layout.js';

const GAP = 3;

const overlaps = (rect, box) =>
  rect.x < box.x + box.width &&
  rect.x + rect.width > box.x &&
  rect.y < box.y + box.height &&
  rect.y + rect.height > box.y;

// what floats over a player (his skill's name, his combo's level) is kept on the view and off
// the HUD's boxes: pushed under one along the top, or over the minimap at the foot
export function placeClear(match, rect) {
  const x = Math.round(Math.min(Math.max(2, rect.x), VIEW.width - 2 - rect.width));
  let y = Math.round(rect.y);

  for (const box of hudBoxes(match)) {
    if (overlaps({ ...rect, x, y }, box)) {
      const isHigh = box.y + box.height / 2 < VIEW.height / 2;

      y = isHigh ? box.y + box.height + GAP : box.y - GAP - rect.height;
    }
  }

  return { ...rect, x, y };
}
