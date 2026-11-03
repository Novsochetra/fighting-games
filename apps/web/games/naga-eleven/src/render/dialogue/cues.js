import { NEXT_ARROW } from '../../art/dialogue/cues.js';
import { ART_KEYS } from '../../art/dialogue/palette.js';
import { ART, drawPixelMap } from './pixel-map.js';

const BLINK = { on: 30, off: 10 };
const BOB_TICKS = 12;

export const arrowShown = (tick) => tick % (BLINK.on + BLINK.off) < BLINK.on;

export function drawNextArrow(context, { x, y }, tick) {
  if (!arrowShown(tick)) {
    return;
  }

  const bob = Math.floor(tick / BOB_TICKS) % 2 === 0 ? 0 : ART;

  drawPixelMap(context, NEXT_ARROW, { x, y: y + bob, colors: ART_KEYS });
}
