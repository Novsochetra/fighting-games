import { BLACK } from '../../art/backdrops/black.js';
import { VIEW } from '../../config.js';
import { drawLayer } from '../backdrops/cache.js';
import { createRaster } from '../backdrops/raster.js';
import { drawChapterCard } from './chapter-cards.js';
import { drawEmbers, drawGlints } from './sparks.js';
import { paintTitle, titleLayout } from './title-scene.js';

export { drawChapterCard };

const LAYOUT = titleLayout(createRaster());

// the title screen's picture behind the name: the still painting is cached with the backdrops
// (setBackdropCanvasFactory), the embers and the Naga's eyes move over it
export function drawTitleArt(context, { tick = 0 } = {}) {
  context.save();
  context.imageSmoothingEnabled = false;
  context.fillStyle = BLACK;
  context.fillRect(0, 0, VIEW.width, VIEW.height);
  drawLayer(context, {
    key: 'title',
    paint: () => {
      const raster = createRaster();

      paintTitle(raster);

      return raster;
    },
  });
  drawEmbers(context, { layout: LAYOUT, tick });
  drawGlints(context, { layout: LAYOUT, tick });
  context.restore();
}
