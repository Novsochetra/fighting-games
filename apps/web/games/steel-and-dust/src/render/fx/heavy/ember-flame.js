import { EMBER_HEAVY_ART } from '../../../art/heavy-fx/ember.js';
import { PIXEL, snap } from '../fine-pixels.js';

const RAMP = EMBER_HEAVY_ART.flame;
// a tongue is widest a little below its middle and rounds off at its foot
const WIDEST = 0.72;
// how far down the tongue (0 tip, 1 foot) each band starts, its share of the row, and its ramp step:
// red at the tip and edges, orange body, gold heart low down, white-hot only at the foot
const BANDS = [
  { from: 0, share: 1, step: 3 },
  { from: 0.3, share: 0.62, step: 2 },
  { from: 0.5, share: 0.38, step: 1 },
  { from: 0.7, share: 0.16, step: 0 },
];
const TIP = 0.28;

// half widths, in screen pixels, of a flame tongue's rows from its tip down to its foot
export function flameRows(rows) {
  const widest = Math.max(1, rows * 0.26);
  return Array.from({ length: rows }, (_, row) => {
    const share = (row + 0.5) / rows;
    const reach = share < WIDEST ? Math.sqrt(share / WIDEST) : 1 - (share - WIDEST) * 1.8;
    return Math.max(0, Math.round(widest * reach - 0.35));
  });
}

function colorAt(step, cool) {
  return RAMP[Math.min(RAMP.length - 1, step + cool)];
}

function span(context, { middle, top, half }) {
  context.fillRect(middle - half * PIXEL, top, (half * 2 + 1) * PIXEL, PIXEL);
}

// one row: the outer band across its whole span, each hotter band narrower within it
function drawRow(context, { middle, top, half, down, cool }) {
  for (const band of BANDS) {
    if (down < band.from) {
      return;
    }
    const tipped = band.step === 3 && down < TIP ? 4 : band.step;
    context.fillStyle = colorAt(tipped, cool);
    span(context, { middle, top, half: Math.floor(half * band.share) });
  }
}

// a tongue of phoenix fire standing on (x, y), `height` world pixels tall; its tip sways by `sway`
// screen pixels, and `cool` (0 to 2) reddens it as it burns down
export function drawFlame(context, { x, y, height, sway = 0, cool = 0 }) {
  const rows = Math.max(2, Math.round(height / PIXEL));
  const foot = snap(y);
  const steps = Math.round(cool);
  flameRows(rows).forEach((half, row) => {
    const lean = Math.round(sway * (1 - row / rows) ** 2) * PIXEL;
    const top = foot - (rows - row) * PIXEL;
    drawRow(context, { middle: snap(x) + lean, top, half, down: row / rows, cool: steps });
  });
}
