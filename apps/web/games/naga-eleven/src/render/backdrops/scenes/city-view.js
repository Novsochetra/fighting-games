import { hash } from '../hash.js';
import { fillRect, hline, plot } from '../raster.js';
import { paintCumulus } from '../parts/clouds.js';

// Phnom Penh from a high window by day: towers, the old low roofs, the river with its far bank
export function paintCityView(raster, { rect, art }) {
  const { x, y, width, height } = rect;
  const river = y + Math.round(height * 0.72);

  for (let row = y; row < river; row += 1) {
    hline(
      raster,
      { x, y: row, length: width },
      art.sky[Math.min(4, Math.floor(((row - y) / (river - y)) * 5))],
    );
  }

  paintCumulus(raster, {
    x: x + 40,
    y: y + 30,
    width: 50,
    height: 9,
    colors: [art.blind, art.paper[1], art.paper[2], art.paper[2]],
    seed: 3,
  });

  for (let towerX = x + 2; towerX < x + width - 6; towerX += 9) {
    const tall = 8 + Math.floor(hash(towerX, 1) * (hash(towerX, 2) > 0.8 ? 46 : 22));
    const ramp = art.towers[Math.floor(hash(towerX, 3) * 2)];

    fillRect(raster, { x: towerX, y: river - tall, width: 8, height: tall }, ramp[1]);
    fillRect(raster, { x: towerX, y: river - tall, width: 2, height: tall }, ramp[2]);

    for (let floor = river - tall + 2; floor < river - 1; floor += 3) {
      hline(raster, { x: towerX + 3, y: floor, length: 4 }, ramp[0]);
    }
  }

  fillRect(raster, { x, y: river, width, height: y + height - river }, art.river[0]);

  for (let row = river + 1; row < y + height; row += 2) {
    for (let column = x; column < x + width; column += 1) {
      if (hash(column >> 3, row) > 0.7) {
        plot(raster, column, row, art.river[1]);
      }
    }
  }

  fillRect(raster, { x, y: river - 2, width, height: 2 }, art.trees[0]);
  hline(raster, { x, y: river - 3, length: width }, art.trees[1]);
}
