import { loadEnemySprites } from './fighters/enemy-sprites.js';
import { createHeroSheets } from './fighters/hero-sheets.js';
import { createPainter } from './painter.js';
import { buildHills } from './scene/hills.js';
import { buildSkyline } from './scene/skyline.js';
import { buildSky } from './scene/sky.js';

// everything the renderer keeps between frames; the backdrops are painted once up front
export function createView({ context, createCanvas, createImage, baseUrl }) {
  context.imageSmoothingEnabled = false;
  const view = {
    painter: createPainter(context),
    backdrop: {
      sky: buildSky(createCanvas),
      hills: buildHills(createCanvas),
      skyline: buildSkyline(createCanvas),
    },
    loaders: { createImage, createCanvas, baseUrl },
    enemySheets: loadEnemySprites({ createImage, createCanvas, baseUrl }),
    shownScore: 0,
    vignette: null,
  };
  createHeroSheets(view);
  return view;
}
