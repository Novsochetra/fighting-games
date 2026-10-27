import { VIEW_WIDTH } from '../../config.js';
import { ventFrame } from '../../sim/hazards/vent-beat.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 40;
// drawn half again the sprites' density, the column as tall as the slag it throws (VENT.height)
const VENT_SCALE = 1.5;

// the grate and its column stand behind the fighters, so a raider thrown up shows in front of it
export function drawVents(painter, sheets, { vents, cameraX }) {
  for (const vent of vents) {
    if (vent.x > cameraX - MARGIN && vent.x < cameraX + VIEW_WIDTH + MARGIN) {
      const frame = ventFrame(vent.time);

      drawFxFrame(painter, sheets, {
        name: 'slagVent',
        frame,
        x: vent.x,
        y: vent.y,
        scale: VENT_SCALE,
      });
    }
  }
}
