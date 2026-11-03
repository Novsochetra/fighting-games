import { BLACK } from '../../art/backdrops/black.js';
import { CARD_ART } from '../../art/title/cards.js';
import { VIEW } from '../../config.js';
import { drawLayer } from '../backdrops/cache.js';
import { hash } from '../backdrops/hash.js';
import { drawTwinkles } from '../backdrops/parts/drift.js';
import { createRaster } from '../backdrops/raster.js';
import { TEMPLE_DAWN } from '../backdrops/scenes/temple-dawn.js';
import { VILLAGE_DAWN } from '../backdrops/scenes/village-dawn.js';
import { drawCardBand } from './card-band.js';

export { CARD_BAND } from './card-band.js';
import { drawFireworks } from './fireworks.js';
import { paintNightStadium, standTop } from './stadium-night.js';

// A card a chapter opens on: its place, with a dark band across the middle the chapter's name is
// written on. 1 the village field at dawn, 2 the temple steps, 3 a night stadium in Asia, 4 the
// world's biggest stage.

const FLASHES = (tiers) =>
  Array.from({ length: 24 }, (_, i) => ({
    x: Math.floor(hash(i, 7) * 384),
    y: standTop(tiers) + 4 + Math.floor(hash(i, 8) * (136 - standTop(tiers))),
  }));

const CARDS = {
  1: { paint: (raster) => VILLAGE_DAWN.paint(raster, 0), overlay: VILLAGE_DAWN.overlay },
  2: { paint: (raster) => TEMPLE_DAWN.paint(raster), overlay: TEMPLE_DAWN.overlay },
  3: {
    paint: (raster) => paintNightStadium(raster, { art: CARD_ART.asia, tiers: 2, banks: 4 }),
    overlay: (context, tick) =>
      drawTwinkles(context, {
        points: FLASHES(2),
        colors: [...CARD_ART.asia.crowd, CARD_ART.asia.flash],
        tick,
        period: 11,
      }),
  },
  4: {
    paint: (raster) =>
      paintNightStadium(raster, { art: CARD_ART.world, tiers: 3, banks: 6, flags: true }),
    overlay: (context, tick) => {
      drawTwinkles(context, {
        points: FLASHES(3),
        colors: [...CARD_ART.world.crowd, CARD_ART.world.flash],
        tick,
        period: 9,
      });
      drawFireworks(context, { colors: CARD_ART.world.fireworks, tick });
    },
  },
};

export function drawChapterCard(context, { number, tick = 0 }) {
  const card = CARDS[number] ?? CARDS[1];

  context.save();
  context.imageSmoothingEnabled = false;
  context.fillStyle = BLACK;
  context.fillRect(0, 0, VIEW.width, VIEW.height);
  drawLayer(context, {
    key: `card:${number}`,
    paint: () => {
      const raster = createRaster();

      card.paint(raster);

      return raster;
    },
  });
  card.overlay(context, tick);
  drawCardBand(context, { width: VIEW.width });
  context.restore();
}
