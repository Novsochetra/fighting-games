import { missionAt } from '../data/missions/index.js';
import { heroSheetFor } from './fighters/hero-sheets.js';
import { backdropFor, backdropPieces, missionRoadLoaded } from './scene/backdrop.js';

// the clock holds and the loading screen stays up until the mission's road and the picked Shade's
// strips are in, so the hero never shows as the bare body drawn for fighters without a sprite
export function sceneLoaded(view, game) {
  if (!missionRoadLoaded(view, game.missionIndex)) {
    return false;
  }
  return heroSheetFor(view, game.settings.hero).settled;
}

// the share of those files that has settled, each road layer and each strip counting once
export function sceneProgress(view, game) {
  const pieces = backdropPieces(backdropFor(view, missionAt(game.missionIndex).theme));
  const sheet = heroSheetFor(view, game.settings.hero);
  const strips = Object.keys(sheet.images).length;
  const settled = pieces.filter((piece) => piece.settled).length + strips - sheet.waiting;
  return settled / (pieces.length + strips);
}

// what the loading screen shows during play: the share in while the scene waits, else null; on
// the title or a menu the canvas waits unseen behind them
export function missionWait(view, game) {
  return game.mode === 'play' && !sceneLoaded(view, game) ? sceneProgress(view, game) : null;
}
