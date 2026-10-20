import { PAINTED_BACKDROPS } from '../../data/backdrops.js';
import { buildHills } from './hills.js';
import { loadPaintedBackdrop } from './painted-backdrop.js';
import { scenePalette } from './scene-palette.js';
import { buildSkyline } from './skyline/index.js';
import { buildSky } from './sky.js';

function buildBackdrop(view, themeId) {
  if (PAINTED_BACKDROPS[themeId]) {
    return loadPaintedBackdrop(view.loaders, PAINTED_BACKDROPS[themeId]);
  }
  const palette = scenePalette(themeId);
  const { createCanvas } = view.loaders;
  return {
    sky: buildSky(createCanvas, palette),
    hills: buildHills(createCanvas, palette.hills),
    skyline: buildSkyline(createCanvas, palette),
  };
}

// each mission's far scenery is painted or loaded once, the first time the mission is drawn
export function backdropFor(view, themeId) {
  if (!view.backdrops[themeId]) {
    view.backdrops[themeId] = buildBackdrop(view, themeId);
  }
  return view.backdrops[themeId];
}
