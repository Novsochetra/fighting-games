import { drawText } from '../text/draw-text.js';

// damage numbers rise, pop in big for a moment, and blink before they vanish
export function drawFloaters(painter, floaters) {
  for (const floater of floaters) {
    const { time, big } = floater;
    const y =
      floater.y - Math.min(time, 14) * (big ? 0.8 : 0.6) - (time < 5 ? (5 - time) * 0.6 : 0);
    if (time > (big ? 60 : 30) && (time >> 1) % 2) {
      continue;
    }
    const scale = (floater.size || 1) + (time < 3 && !big ? 1 : 0);
    drawText(painter, floater.text, {
      x: floater.x,
      y,
      color: floater.color,
      scale,
      align: 'center',
    });
  }
}
