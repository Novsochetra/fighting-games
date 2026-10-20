import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { START_LIVES } from '../../data/player.js';

const HEART_GAP = 9;

// a 7x6 pixel heart as [left, width] runs, one row at a time from the top
const HEART_ROWS = [
  [
    [1, 2],
    [4, 2],
  ],
  [[0, 7]],
  [[0, 7]],
  [[1, 5]],
  [[2, 3]],
  [[3, 1]],
];

function drawHeart(painter, { x, y, full }) {
  painter.use(full ? COLORS.red : HUD_COLORS.barTrough);
  HEART_ROWS.forEach((runs, row) => {
    for (const [left, width] of runs) {
      painter.rect(x + left, y + row, width, 1);
    }
  });
  if (full) {
    painter.use(COLORS.salmon).rect(x + 1, y + 1, 1, 1);
  }
}

// a full heart for every life left and a dark one for every life lost
export function drawLives(painter, { lives, x, y }) {
  for (let i = 0; i < START_LIVES; i++) {
    drawHeart(painter, { x: x + i * HEART_GAP, y, full: i < lives });
  }
}
