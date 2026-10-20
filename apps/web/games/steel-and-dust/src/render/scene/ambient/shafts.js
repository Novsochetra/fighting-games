import { GROUND_Y } from '../../../config.js';
import { fillClipped, scrollX } from './motion.js';

// rows that share a shear offset merge into one rect, so a shaft costs ~GROUND_Y * slope calls
function drawShaft(painter, { left, width, slope }) {
  let runTop = 0;
  let runShift = 0;
  for (let y = 1; y <= GROUND_Y; y++) {
    const shift = Math.round(y * slope);
    if (shift !== runShift || y === GROUND_Y) {
      fillClipped(painter, { x: left + runShift, y: runTop, width, height: y - runTop });
      runTop = y;
      runShift = shift;
    }
  }
}

export function drawShafts(painter, { effect, tick, cameraX, colors }) {
  const slope = effect.slope ?? 0;
  painter.use(colors.shaft);
  effect.shafts.forEach((shaft, index) => {
    const reach = shaft.width + Math.ceil(Math.abs(slope) * GROUND_Y);
    const left = Math.round(scrollX(shaft.x, { cameraX, drift: effect.drift, margin: reach }));
    painter.alpha(0.07 + 0.03 * Math.sin(tick * 0.012 + index * 1.9));
    drawShaft(painter, { left, width: shaft.width, slope });
  });
  painter.alpha(1);
}
