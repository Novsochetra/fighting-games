import { VIEW_WIDTH } from '../../config.js';
import { SCORE_BOX } from '../../render/hud/score.js';
import { TOP_BAR_HEIGHT } from '../../render/hud/top-bar.js';

// the pause button's side in styles/touch.css, and the room it leaves the score
const PAUSE_SIZE = 44;
const GAP = 8;

// a stage over the touch buttons takes the top of the screen, so the pause button stands on it, in
// the HUD's top row just left of the score, where it covers none of the fight. Over the fight (a
// phone held sideways) and on the bottom half of a phone folded on a table it keeps the touch
// layer's top-right corner (styles/touch.css): null
export function pausePlace({ rect, controlsBelow, hinge, width }) {
  if (!controlsBelow || hinge?.stacked) {
    return null;
  }

  const scale = rect.width / VIEW_WIDTH;
  const scoreWidth = Math.round((VIEW_WIDTH - SCORE_BOX.x) * scale);

  return {
    top: rect.y + Math.max(0, Math.round((TOP_BAR_HEIGHT * scale - PAUSE_SIZE) / 2)),
    right: width - rect.x - rect.width + scoreWidth + GAP,
  };
}

// set on the app, so the Button layout editor's copy of the pause button stands there too
export function placePause(app, place) {
  for (const side of ['top', 'right']) {
    if (place) {
      app.style.setProperty(`--pause-${side}`, `${place[side]}px`);
    } else {
      app.style.removeProperty(`--pause-${side}`);
    }
  }
}
