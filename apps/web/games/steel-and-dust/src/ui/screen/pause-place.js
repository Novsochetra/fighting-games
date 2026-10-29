import { VIEW_WIDTH } from '../../config.js';
import { SCORE_BOX } from '../../render/hud/score.js';
import { TOP_BAR_HEIGHT, VITALS_BOX, WEAPON_BOX } from '../../render/hud/top-bar.js';

// the room the HUD leaves between two plaques of its top row, in the game's pixels
const GAP = VITALS_BOX.x - WEAPON_BOX.width;

// a stage over the touch buttons takes the top of the screen, so the pause button stands on it, one
// more carved plaque of the HUD's top row, as tall as the row and just left of the score, where it
// covers none of the fight; `pixel` is one of the game's pixels on the screen, which its frame is
// drawn in (styles/touch.css); so does a stage a skin's shell frames, its controls beside it. Over
// the fight (a phone held sideways) and on the bottom half of a phone folded on a table it keeps
// the touch layer's top-right corner (styles/touch.css): null
export function pausePlace({ rect, controlsBelow, framed, hinge, width }) {
  if (!(controlsBelow || framed) || hinge?.stacked) {
    return null;
  }

  const pixel = rect.width / VIEW_WIDTH;

  return {
    top: Math.round(rect.y),
    right: Math.round(width - rect.x - (SCORE_BOX.x - GAP) * pixel),
    size: Math.round(TOP_BAR_HEIGHT * pixel),
    pixel,
  };
}

// set on the app, so the Skins screen's copy of the pause button stands there too
export function placePause(app, place) {
  app.classList.toggle('pause-in-hud', Boolean(place));

  for (const name of ['top', 'right', 'size', 'pixel']) {
    if (place) {
      app.style.setProperty(`--pause-${name}`, `${place[name]}px`);
    } else {
      app.style.removeProperty(`--pause-${name}`);
    }
  }
}
