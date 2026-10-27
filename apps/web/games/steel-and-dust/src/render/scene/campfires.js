import { VIEW_WIDTH } from '../../config.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 24;
const { frames, ticks } = FX_SPRITES.campfire;

// each fire flickers on its own beat, so two in view never burn in step
export function campfireFrame(fire, tick) {
  return Math.floor((tick + fire.x) / ticks) % frames;
}

export function drawCampfires(painter, sheets, { campfires, cameraX, tick }) {
  for (const fire of campfires) {
    if (fire.x > cameraX - MARGIN && fire.x < cameraX + VIEW_WIDTH + MARGIN) {
      const frame = campfireFrame(fire, tick);

      drawFxFrame(painter, sheets, { name: 'campfire', frame, x: fire.x, y: fire.y });
    }
  }
}
