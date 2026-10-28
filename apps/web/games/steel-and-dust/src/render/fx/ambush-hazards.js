import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawDropShadow } from './drop-shadow.js';
import { drawFxFrame } from './fx-sheets.js';
import { drawPerchedRaider } from './perched-raider.js';

const MOUND_SCALE = 0.75;

// a raider waiting overhead shows as its shadow on the road under it, and itself too while it
// waits on a ledge in sight
export function drawDropMark(painter, mark, sheets, road) {
  drawDropShadow(painter, mark, road.floorAt);
  if (mark.perch?.kind === 'ledge' && !mark.raider) {
    drawPerchedRaider(painter, mark, road);
  }
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
