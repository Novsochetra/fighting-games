import { PAINTED_BACKDROPS } from '../../data/backdrops/index.js';
import { MISSIONS, missionAt } from '../../data/missions/index.js';
import { loadPaintedBackdrop } from './painted-backdrop.js';

// each mission's painted layers are loaded once: ahead of time while the mission before it is
// fought, or the first time the mission is drawn
export function backdropFor(view, themeId) {
  view.backdrops[themeId] ||= loadPaintedBackdrop(view.loaders, PAINTED_BACKDROPS[themeId]);
  return view.backdrops[themeId];
}

export function backdropPieces({ layers, fronts, ground, cliff, deep }) {
  return [...layers, ...fronts, ground, cliff, deep, deep?.face, deep?.breach].filter(Boolean);
}

export function backdropSettled(backdrop) {
  return backdropPieces(backdrop).every((piece) => piece.settled);
}

// a mission is drawn and its clock runs only once its own road is in; then the next mission's road
// starts loading, so walking on to it rarely has to wait
export function missionRoadLoaded(view, missionIndex) {
  if (!backdropSettled(backdropFor(view, missionAt(missionIndex).theme))) {
    return false;
  }
  const next = MISSIONS[missionIndex + 1];
  if (next) {
    backdropFor(view, next.theme);
  }
  return true;
}
