import { currentLine, isSkipAsked } from '../../story/scene.js';
import { PLATE_HEIGHT } from './plate.js';
import { OVERLAY_CAPTION, overlayLayout, skipTouchRect } from './layout.js';
import { overlayRise } from './draw-overlay.js';

const inside = (point, rect) =>
  point.x >= rect.x &&
  point.x < rect.x + rect.width &&
  point.y >= rect.y &&
  point.y < rect.y + rect.height;

// a tap on the name plate is a tap on its box
function overlayRect(state, line) {
  const rise = overlayRise(state);

  if (!line.portrait) {
    return { ...OVERLAY_CAPTION, y: OVERLAY_CAPTION.y + rise };
  }

  const { box } = overlayLayout(line.side);

  return { ...box, y: box.y - PLATE_HEIGHT + rise, height: box.height + PLATE_HEIGHT };
}

// a tap in view pixels: on a full-screen scene anywhere but round the skip tag goes on, as a press does;
// over a match only a tap on the box does, the rest of the view still being the match's
export function hitTest(state, point, { overlay = false } = {}) {
  const line = currentLine(state);

  if (!line) {
    return null;
  }

  if (overlay) {
    return inside(point, overlayRect(state, line)) ? 'confirm' : null;
  }

  return inside(point, skipTouchRect(isSkipAsked(state))) ? 'skip' : 'confirm';
}
