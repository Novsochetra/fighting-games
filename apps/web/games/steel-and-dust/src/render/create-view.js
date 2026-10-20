import { loadEnemySprites } from './fighters/enemy-sprites.js';
import { createHeroSheets } from './fighters/hero-sheets.js';
import { loadFxSheets } from './fx/fx-sheets.js';
import { createPainter } from './painter.js';

// everything the renderer keeps between frames
export function createView({ context, createCanvas, createImage, baseUrl }) {
  context.imageSmoothingEnabled = false;
  const view = {
    painter: createPainter(context),
    backdrops: {},
    loaders: { createImage, createCanvas, baseUrl },
    enemySheets: loadEnemySprites({ createImage, createCanvas, baseUrl }),
    fxSheets: loadFxSheets({ createImage, createCanvas, baseUrl }),
    shownScore: 0,
    vignette: null,
  };
  createHeroSheets(view);
  return view;
}
