import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { HAMMER } from '../../data/hammers.js';
import { hammerPhase, headLift } from '../../sim/hazards/hammer-beat.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 40;
const PIPE_HEIGHT = FX_SPRITES.hammerPipe.frameHeight * FX_SCALE;
const HEAD_HEIGHT = FX_SPRITES.hammerHead.frameHeight * FX_SCALE;

const inView = (hammer, cameraX) =>
  hammer.x > cameraX - MARGIN && hammer.x < cameraX + VIEW_WIDTH + MARGIN;

// the floor under a hammer about to drop turns red and blinks harder as it comes, like every boss
// danger (danger-zone.js)
function drawMark(painter, hammer, tick) {
  const { phase, at } = hammerPhase(hammer.time);
  if (phase !== 'warn') {
    return;
  }

  const progress = (at + 1) / HAMMER.warn;
  const x = hammer.x - HAMMER.halfWidth;
  const width = HAMMER.halfWidth * 2;
  painter.alpha(0.3 + 0.4 * progress * ((tick >> 2) & 1 ? 1 : 0.55));
  painter.use(COLORS.red).rect(x, hammer.y - 1, width, 6);
  painter.use(FX_COLORS.dangerLight).rect(x, hammer.y - 1, width, 1);
  painter.alpha(1);
}

export function drawHammerMarks(painter, { hammers, cameraX, tick }) {
  for (const hammer of hammers) {
    if (inView(hammer, cameraX)) {
      drawMark(painter, hammer, tick);
    }
  }
}

// the piston runs up out of the top of the view, a tile at a time, from the head it drives
function drawHammer(painter, sheets, hammer) {
  const bottom = hammer.y - headLift(hammer.time);

  for (let y = bottom - HEAD_HEIGHT + 1; y > 0; y -= PIPE_HEIGHT) {
    drawFxFrame(painter, sheets, { name: 'hammerPipe', frame: 0, x: hammer.x, y });
  }

  drawFxFrame(painter, sheets, { name: 'hammerHead', frame: 0, x: hammer.x, y: bottom });
}

export function drawHammers(painter, sheets, { hammers, cameraX }) {
  for (const hammer of hammers) {
    if (inView(hammer, cameraX)) {
      drawHammer(painter, sheets, hammer);
    }
  }
}
