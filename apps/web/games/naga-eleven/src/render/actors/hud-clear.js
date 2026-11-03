import { VIEW } from '../../config.js';
import { hudBoxes } from '../hud/layout.js';

const GAP = 3;

const isAcross = (box, { x, half }) => x + half >= box.x && x - half <= box.x + box.width;

// what points at the play from an edge (the arrow to the steered player, the ball over the view)
// is pushed down under any HUD box along the top it would stand behind, or up over the minimap at
// the foot; `top` is its top row, `half` half its width, and it reaches `half` down from `top`
export function clearOfHud(match, { x, top, half = 0 }) {
  let clear = top;

  for (const box of hudBoxes(match)) {
    const isHigh = box.y + box.height / 2 < VIEW.height / 2;

    if (!isAcross(box, { x, half })) {
      continue;
    }

    if (isHigh) {
      clear = Math.max(clear, box.y + box.height + GAP);
    } else if (clear + half >= box.y - GAP) {
      clear = Math.min(clear, box.y - GAP - half);
    }
  }

  return clear;
}
