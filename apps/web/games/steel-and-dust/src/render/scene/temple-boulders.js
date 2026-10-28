import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { TEMPLE_BOULDER } from '../../data/temple-boulders.js';
import { rollFrame } from '../../sim/hazards/boulder-roll.js';
import { groundAt } from '../../sim/stage/terrain.js';
import { drawFxFrame } from '../fx/fx-sheets.js';
import { drawText } from '../text/draw-text.js';

const { direction } = TEMPLE_BOULDER;
// the '!' stands on a flashing diamond just in from the edge the boulder comes from, about as high
// as its middle, an arrow beside it pointing out at the edge
const INSET = 20;
const RAISE = 30;
const HALF = 8;

function drawDiamond(painter, { x, y, half, color }) {
  painter.use(color);
  for (let row = -half; row <= half; row++) {
    const width = half - Math.abs(row);

    painter.rect(x - width, y + row, width * 2 + 1, 1);
  }
}

function drawArrow(painter, { x, y, color }) {
  painter.use(color);
  for (let i = 0; i < 4; i++) {
    painter.rect(x - direction * i, y - (3 - i), 1, (3 - i) * 2 + 1);
  }
}

function drawWarning(painter, { terrain, cameraX, tick }) {
  const x = direction < 0 ? cameraX + VIEW_WIDTH - INSET : cameraX + INSET;
  const y = groundAt(terrain, x) - RAISE;
  const color = (tick >> 2) & 1 ? COLORS.amber : COLORS.scarlet;

  drawDiamond(painter, { x, y, half: HALF + 1, color: COLORS.outline });
  drawDiamond(painter, { x, y, half: HALF, color });
  drawText(painter, '!', { x: x + 1, y: y - 5, color: COLORS.white, scale: 2, align: 'center' });
  drawArrow(painter, { x: x - direction * (HALF + 6), y, color });
}

// the sheet turns it rolling right, so it is drawn facing left to roll left
export function drawTempleBoulders(painter, sheets, { game, cameraX }) {
  for (const boulder of game.boulders) {
    if (boulder.state === 'loose') {
      drawWarning(painter, { terrain: game.terrain, cameraX, tick: game.tickCount });
    } else if (boulder.state === 'rolling') {
      const frame = rollFrame(boulder.rolled);
      const { x, y } = boulder;

      drawFxFrame(painter, sheets, { name: 'templeBoulder', frame, x, y, facing: direction });
    }
  }
}
