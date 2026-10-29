import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { START_HEARTS } from '../../data/player.js';
import { heartsLeft } from '../../sim/stage/lives.js';

const HEART_GAP = 9;
const HEART_WIDTH = 7;
export const LIVES_WIDTH = (START_HEARTS - 1) * HEART_GAP + HEART_WIDTH;

// a 7x6 pixel heart as [left, width] runs, one row at a time from the top
const HEART_ROWS = [
  [
    [1, 2],
    [4, 2],
  ],
  [[0, HEART_WIDTH]],
  [[0, HEART_WIDTH]],
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

// a full heart for every life still to come and a dark one for every life lost
export function drawLives(painter, { lives, x, y }) {
  const hearts = heartsLeft(lives);

  for (let i = 0; i < START_HEARTS; i++) {
    drawHeart(painter, { x: x + i * HEART_GAP, y, full: i < hearts });
  }
}
