import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { SLAB } from '../../data/slabs.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = SLAB.halfWidth + 8;
const FRAMES = { whole: 0, cracking: 1, breaking: 2, broken: 3 };
// the cracks spread over its first ticks, flickering between whole and cracked
const SPREAD_UNTIL = 12;

export function slabFrame(slab) {
  if (slab.state === 'cracking' && slab.time < SPREAD_UNTIL) {
    return Math.floor(slab.time / 3) % 2;
  }

  return FRAMES[slab.state];
}

// a cracking slab blinks red, harder as it is about to give way, like every boss danger
function drawWarning(painter, slab, tick) {
  const progress = (slab.time + 1) / SLAB.crack;
  const x = slab.x - SLAB.halfWidth;
  const width = SLAB.halfWidth * 2;

  painter.alpha(0.25 + 0.35 * progress * ((tick >> 2) & 1 ? 1 : 0.5));
  painter.use(COLORS.red).rect(x, slab.y - 1, width, 6);
  painter.use(FX_COLORS.dangerLight).rect(x, slab.y - 1, width, 1);
  painter.alpha(1);
}

function drawSlab(painter, sheets, { slab, tick }) {
  const { x, y } = slab;

  drawFxFrame(painter, sheets, {
    name: 'crackedFloor',
    frame: slabFrame(slab),
    x,
    y,
    scale: SLAB.scale,
  });
  if (slab.state === 'cracking') {
    drawWarning(painter, slab, tick);
  }
}

export function drawSlabs(painter, sheets, { slabs, cameraX, tick }) {
  for (const slab of slabs) {
    if (slab.x > cameraX - MARGIN && slab.x < cameraX + VIEW_WIDTH + MARGIN) {
      drawSlab(painter, sheets, { slab, tick });
    }
  }
}
