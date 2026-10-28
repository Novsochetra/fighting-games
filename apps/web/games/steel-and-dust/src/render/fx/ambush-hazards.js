import { COLORS } from '../../art/colors.js';
import { DROP } from '../../data/ambush.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame } from './fx-sheets.js';
import { drawLandingShadow } from './rock-hazards.js';

// how far above the spot the shadow is drawn as if the raider were, per tick still to wait
const SINK = 3;
const MOUND_SCALE = 0.75;

// while the raider settles in the branches overhead its shadow only gathers on the ground, a
// faint smudge that widens and darkens
function drawGatheringShadow(painter, mark) {
  const grown = Math.min(1, mark.time / (DROP.warn - DROP.markFrom));
  const half = Math.round(3 + 4 * grown);

  painter.alpha(0.15 + 0.3 * grown).use(COLORS.outline);
  painter.rect(mark.x - half, mark.y - 1, half * 2, 2);
  painter.rect(mark.x - half + 2, mark.y - 2, half * 2 - 4, 1);
  painter.alpha(1);
}

// then the spot is marked as a pounce's is, a shadow that grows and darkens under a blinking red
// bar, as it is about to drop and as it comes down
export function drawDropMark(painter, mark) {
  if (!mark.raider && mark.time < DROP.warn - DROP.markFrom) {
    drawGatheringShadow(painter, mark);
    return;
  }

  const y = mark.raider ? mark.raider.y : mark.y - (DROP.warn - mark.time) * SINK;

  drawLandingShadow(painter, { x: mark.x, floor: mark.y, y, time: mark.time });
}

// a mound loops its strip as it crawls, and quicker, shaking, as it stops to rumble
export function drawMound(painter, mound, sheets) {
  if (mound.eruptAt) {
    return;
  }

  const { frames, ticks } = FX_SPRITES.mound;
  const rumbling = mound.haltAt > 0;
  const frame = Math.floor(mound.time / (rumbling ? 3 : ticks)) % frames;
  const shakeX = rumbling ? ((mound.time >> 1) & 1) * 2 - 1 : 0;

  drawFxFrame(painter, sheets, {
    name: 'mound',
    frame,
    x: mound.x + shakeX,
    y: mound.y,
    scale: MOUND_SCALE,
    facing: mound.direction,
  });
}
