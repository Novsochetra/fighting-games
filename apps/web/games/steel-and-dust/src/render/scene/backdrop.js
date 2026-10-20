import { PAINTED_BACKDROPS } from '../../data/backdrops/index.js';
import { loadPaintedBackdrop } from './painted-backdrop.js';

// each mission's painted layers are loaded once, the first time the mission is drawn
export function backdropFor(view, themeId) {
  view.backdrops[themeId] ||= loadPaintedBackdrop(view.loaders, PAINTED_BACKDROPS[themeId]);
  return view.backdrops[themeId];
}
