import { ring } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';

const PULSE = { ticks: 16, from: 18, grow: 8 };

const BANDS = [
  { width: 1, color: SHOT_ART.gold[3] },
  { width: 2, color: SHOT_ART.gold[2] },
  { width: 2, color: SHOT_ART.emerald[4] },
  { width: 3, color: SHOT_ART.emerald[3] },
  { width: 4, color: SHOT_ART.emerald[1] },
];

function drawRing(pen, { x, y, radius, thin }) {
  let edge = radius;

  BANDS.forEach(({ width, color }) => {
    const band = Math.max(1, Math.round(width * thin));

    if (edge - band > 0) {
      ring(pen, { x, y, radius: edge, width: band, color });
    }

    edge -= band;
  });
}

export function drawPulse(pen, { at, pulse }) {
  if (pulse < 0 || pulse >= PULSE.ticks) {
    return;
  }

  const thin = 1 - pulse / PULSE.ticks;
  const radius = PULSE.from + pulse * PULSE.grow;

  drawRing(pen, { ...at, radius, thin });

  if (pulse >= 3) {
    drawRing(pen, { ...at, radius: radius * 0.62, thin: thin * 0.6 });
  }
}
