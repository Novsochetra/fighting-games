import { heroSheetFor } from './fighters/hero-sheets.js';
import { missionRoadLoaded } from './scene/backdrop.js';

// the clock holds and the loading screen stays up until the mission's road and the picked Shade's
// strips are in, so the hero never shows as the bare body drawn for fighters without a sprite
export function sceneLoaded(view, game) {
  if (!missionRoadLoaded(view, game.missionIndex)) {
    return false;
  }
  return heroSheetFor(view, game.settings.hero).settled;
}
