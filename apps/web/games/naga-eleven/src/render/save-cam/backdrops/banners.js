import { rect } from '../../venues/kit/raster.js';

// a wall along the end of the pitch: a light cap along its top, its foot in shade, and the venue's
// own banners hung on it, each cloth in its colour with its ink in bands and a badge, no words
export function paintBannerWall(raster, { top, bottom, wall, banners, at }) {
  const [deep, mid, light, cap] = wall;

  rect(raster, { x: 0, y: top, width: raster.width, height: bottom - top }, mid);
  rect(raster, { x: 0, y: top, width: raster.width, height: 1 }, cap);
  rect(raster, { x: 0, y: top + 1, width: raster.width, height: 1 }, light);
  rect(raster, { x: 0, y: bottom - 1, width: raster.width, height: 1 }, deep);

  at.forEach((x, i) => {
    const banner = banners[i % banners.length];

    rect(raster, { x, y: top + 3, width: 52, height: 7 }, banner.back);
    rect(raster, { x: x + 2, y: top + 4, width: 48, height: 1 }, banner.ink);
    rect(raster, { x: x + 2, y: top + 8, width: 48, height: 1 }, banner.ink);
    rect(raster, { x: x + 24, y: top + 5, width: 4, height: 3 }, banner.ink);
    rect(raster, { x, y: top + 10, width: 52, height: 1 }, deep);
  });
}
