import { FEDERATION_ART } from '../../../art/backdrops/city.js';
import { glow } from '../dither.js';
import { hash } from '../hash.js';
import { drawMotes } from '../parts/drift.js';
import { paintLit } from '../parts/light.js';
import { planks } from '../parts/textures.js';
import { fillRect, hline, vline } from '../raster.js';
import { paintCityView } from './city-view.js';
import { paintDesk, paintShelves } from './office-props.js';

// The federation's office in Phnom Penh: a window over the city and the river, and on the desk
// in a bar of sunlight, the letter that calls Sochetra up
const art = FEDERATION_ART;
const WINDOW = { x: 124, y: 14, width: 200, height: 104 };
const SUNLIT = { x: 230, y: 30, radius: 260, squash: 1.1 };

function paintWindow(raster) {
  paintCityView(raster, { rect: WINDOW, art });

  for (let x = WINDOW.x; x <= WINDOW.x + WINDOW.width; x += 50) {
    fillRect(raster, { x: x - 1, y: WINDOW.y, width: 3, height: WINDOW.height }, art.wall[1]);
  }

  fillRect(
    raster,
    { x: WINDOW.x - 3, y: WINDOW.y + 52, width: WINDOW.width + 6, height: 2 },
    art.wall[1],
  );
  fillRect(
    raster,
    { x: WINDOW.x - 6, y: WINDOW.y + WINDOW.height, width: WINDOW.width + 12, height: 4 },
    art.wall[4],
  );

  for (let slat = WINDOW.y; slat < WINDOW.y + 16; slat += 2) {
    hline(raster, { x: WINDOW.x, y: slat, length: WINDOW.width }, art.blind);
  }

  vline(raster, { x: WINDOW.x + 8, y: WINDOW.y + 16, length: 30 }, art.blind);
}

function paintOffice(raster) {
  paintLit(raster, {
    rect: { x: 0, y: 0, width: 384, height: 216 },
    ramp: art.wall,
    light: SUNLIT,
    texture: (x, y) => (y > 150 && hash(x, y) > 0.92 ? -1 : 0),
  });
  paintWindow(raster);
  paintShelves(raster, { x: 8, y: 20, art });
  paintLit(raster, {
    rect: { x: 0, y: 142, width: 384, height: 74 },
    ramp: art.wood,
    light: { ...SUNLIT, y: 120, radius: 230 },
    texture: planks(9),
  });
  glow(raster, { x: 196, y: 141, radius: 60, colors: [art.wood[3], art.wood[4]], squash: 0.25 });
  paintDesk(raster, { art });
}

export const FEDERATION_OFFICE = {
  paint: paintOffice,
  overlay: (context, tick) =>
    drawMotes(context, {
      area: { x: 150, y: 60, width: 110, height: 80 },
      count: 14,
      colors: [art.paper[2], art.gold[2]],
      tick,
    }),
};
