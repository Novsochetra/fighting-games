import { VIEW_WIDTH } from '../../config.js';
import { KEG } from '../../data/kegs.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 24;
// the keg flashes on and off over the end of its fuse, three ticks a beat
const BEAT = 3;

// unlit, its fuse burning, then flashing white on every other beat as it is about to blow
export function kegFrame(keg, tick) {
  if (!keg.lit) {
    return 0;
  }

  return keg.fuse <= KEG.flashFrom && Math.floor(tick / BEAT) % 2 ? 2 : 1;
}

export function drawKegs(painter, sheets, { kegs, cameraX, tick }) {
  for (const keg of kegs) {
    if (!keg.gone && keg.x > cameraX - MARGIN && keg.x < cameraX + VIEW_WIDTH + MARGIN) {
      const frame = kegFrame(keg, tick);

      drawFxFrame(painter, sheets, { name: 'keg', frame, x: keg.x, y: keg.y + KEG.setIn });
    }
  }
}
