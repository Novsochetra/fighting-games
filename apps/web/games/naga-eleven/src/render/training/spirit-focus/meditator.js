import { MEDITATOR } from '../../../art/training/meditator.js';
import { FOCUS, OFFERING } from '../../../art/training/temple.js';
import { drawShadow } from '../people.js';
import { drawPixelMap } from '../pixel-map.js';
import { faded, paint, pulse } from '../pixels.js';

// his heart, which the golden mark rings and his aura burns round
export const chestOf = ({ x, seat }) => ({ x, y: seat - 19 });

const BREATH_IN = { x: 0, y: -1 };
const STILL = { x: 0, y: 0 };

// Sochetra cross-legged, breathing slow: on each breath in his head and shoulders rise a pixel
// and his chest fills the row they left
export function drawMeditator(context, { x, seat, tick }) {
  const breathing = pulse(tick, 240) > 0.5;
  const shift = (row) => (breathing && row < MEDITATOR.chest ? BREATH_IN : STILL);

  drawShadow(context, { x: x + 2, y: seat, width: 22, alpha: 0.4 });
  drawPixelMap(context, MEDITATOR, { x, y: seat, shift });

  if (breathing) {
    drawPixelMap(context, MEDITATOR, { x, y: seat, only: [MEDITATOR.chest - 1] });
  }
}

// an incense pot with three sticks, its smoke curling up in the still air
export function drawIncense(context, { x, y, tick }) {
  paint(context, OFFERING.pot, [x - 5, y - 6, 11, 6]);
  paint(context, OFFERING.potLight, [x - 5, y - 6, 11, 1]);
  paint(context, OFFERING.potLight, [x - 4, y - 5, 2, 4]);

  for (const dx of [-2, 0, 2]) {
    paint(context, OFFERING.stick, [x + dx, y - 16, 1, 10]);
    paint(context, OFFERING.ember, [x + dx, y - 17, 1, 1]);
  }

  for (let i = 0; i < 9; i += 1) {
    const rise = (tick / 3 + i * 5) % 45;
    const sway = Math.round((pulse(tick + i * 23, 90) - 0.5) * (2 + rise / 8));

    faded(context, 0.6 - rise / 80, () =>
      paint(context, OFFERING.smoke, [x + sway, y - 19 - rise, 1, 2]),
    );
  }
}

// a lotus offered in a bowl
export function drawLotus(context, { x, y }) {
  paint(context, OFFERING.pot, [x - 6, y - 4, 13, 4]);
  paint(context, OFFERING.potLight, [x - 6, y - 4, 13, 1]);
  paint(context, OFFERING.leaf, [x - 7, y - 6, 15, 2]);
  paint(context, FOCUS.lotusShade, [x - 4, y - 11, 9, 5]);
  paint(context, FOCUS.lotus, [x - 3, y - 13, 3, 7]);
  paint(context, FOCUS.lotus, [x + 1, y - 12, 3, 6]);
  paint(context, FOCUS.lotus, [x - 1, y - 15, 3, 9]);
}
