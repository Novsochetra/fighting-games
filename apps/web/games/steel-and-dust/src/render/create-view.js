import { loadEnemySprites } from './fighters/enemy-sheets.js';
import { createHeroSheets } from './fighters/hero-sheets.js';
import { loadFxSheets } from './fx/fx-sheets.js';
import { loadHudFrames } from './hud/hud-frames.js';
import { createPainter } from './painter.js';
import { loadPlatformSprites } from './scene/platforms.js';
import { loadPropSprites } from './scene/props/prop-sprites.js';

// everything the renderer keeps between frames
export function createView({ context, createCanvas, createImage, baseUrl }) {
  context.imageSmoothingEnabled = false;
  const view = {
    painter: createPainter(context),
    backdrops: {},
    loaders: { createImage, createCanvas, baseUrl },
    enemySheets: loadEnemySprites({ createImage, createCanvas, baseUrl }),
    fxSheets: loadFxSheets({ createImage, createCanvas, baseUrl }),
    propSheets: loadPropSprites({ createImage, baseUrl }),
    platformSheets: loadPlatformSprites({ createImage, baseUrl }),
    hudFrames: loadHudFrames({ createImage, baseUrl }),
    shownScore: 0,
    loadingFrames: 0,
    vignette: null,
  };
  createHeroSheets(view);
  return view;
}
