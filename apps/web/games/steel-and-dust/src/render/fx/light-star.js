import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { PIXEL, ellipseRows, fillRows, inLight, snap } from './fine-pixels.js';

// a round glow of light stepped in bands, as pixel art paints one: a wide faint ember haze, a gold
// ring inside it and a brighter gold heart, each added to what lies under it
const HALO_BANDS = [
  { color: FX_COLORS.gazeEmber, size: 1.5, alpha: 0.12 },
  { color: FX_COLORS.gazeGold, size: 1, alpha: 0.2 },
  { color: FX_COLORS.gazeGold, size: 0.6, alpha: 0.3 },
];

export function drawHalo(context, { x, y, radius, strength = 1 }) {
  inLight(context, () => {
    for (const band of HALO_BANDS) {
      context.globalAlpha = Math.min(1, band.alpha * strength);
      context.fillStyle = band.color;
      const size = radius * band.size;
      fillRows(context, { x, y, rows: ellipseRows(size, size) });
    }
  });
  context.globalAlpha = 1;
}

// a four-point star on the screen-pixel grid: long white arms across, shorter up and down, tipped
// in gold, round a hot centre; `arm` is in screen pixels
export function drawStar(context, { x, y, arm }) {
  const left = snap(x - PIXEL / 2);
  const top = snap(y - PIXEL / 2);
  const rise = Math.ceil(arm / 2);
  context.fillStyle = FX_COLORS.gazeGold;
  context.fillRect(left - (arm + 2) * PIXEL, top, (arm * 2 + 5) * PIXEL, PIXEL);
  context.fillRect(left, top - (rise + 1) * PIXEL, PIXEL, (rise * 2 + 3) * PIXEL);
  context.fillStyle = COLORS.white;
  context.fillRect(left - arm * PIXEL, top, (arm * 2 + 1) * PIXEL, PIXEL);
  context.fillRect(left, top - rise * PIXEL, PIXEL, (rise * 2 + 1) * PIXEL);
  context.fillStyle = FX_COLORS.gazeWhite;
  context.fillRect(left - PIXEL, top - PIXEL, PIXEL * 3, PIXEL * 3);
  context.fillStyle = COLORS.white;
  context.fillRect(left, top, PIXEL, PIXEL);
}
