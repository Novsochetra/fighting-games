import { buildHills } from './hills.js';
import { scenePalette } from './scene-palette.js';
import { buildSkyline } from './skyline/index.js';
import { buildSky } from './sky.js';

// each mission's far scenery is painted once, the first time the mission is drawn
export function backdropFor(view, themeId) {
  if (!view.backdrops[themeId]) {
    const palette = scenePalette(themeId);
    const { createCanvas } = view.loaders;
    view.backdrops[themeId] = {
      sky: buildSky(createCanvas, palette),
      hills: buildHills(createCanvas, palette.hills),
      skyline: buildSkyline(createCanvas, palette),
    };
  }
  return view.backdrops[themeId];
}
