import { ANTLER_HEAVY_ART as ART } from '../../../art/heavy-fx/antler.js';
import { PIXEL, flicker, snap } from '../fine-pixels.js';

// tiny tongues of ghost fire in screen pixels, top row first, from young to nearly spent; a digit is
// a step down the flame's colors from where the wisp's age has burned it to, so a young tongue has a
// white tip over a deep teal root and an old one is a fleck of smoke
const FLAMES = [
  ['.0.', '.1.', '111', '121', '232', '.3.'],
  ['.0.', '.1.', '121', '.2.'],
  ['1', '2'],
];
// the top of a tongue sways a pixel one way and back as it climbs
const SWAY_ROWS = 2;
// a cloven hoofprint seen low along the road: two toes edged in dark teal, lit over a deeper rim
const HOOF = ['.eeee.eeee.', 'e1111e1111e', 'e2222e2222e', '.eeee.eeee.'];
const HOOF_HALF = 5;
const HOOF_FRESH = 4;

// one character a screen pixel; '.' is left clear and the rest are colored by `colorOf`
function drawPixels(context, { rows, left, top, colorOf, sway = 0 }) {
  rows.forEach((row, j) => {
    const shift = j < SWAY_ROWS ? sway : 0;
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== '.') {
        context.fillStyle = colorOf(row[i]);
        context.fillRect(left + i * PIXEL + shift, top + j * PIXEL, PIXEL, PIXEL);
      }
    }
  });
}

export function drawFlame(context, particle) {
  const share = particle.life / particle.maxLife;
  const burn = Math.min(FLAMES.length - 1, Math.floor((1 - share) * FLAMES.length));
  const colorOf = (digit) => ART.flame[Math.min(ART.flame.length - 1, Number(digit) + burn)];
  context.globalAlpha = Math.min(1, share * 4);
  drawPixels(context, {
    rows: FLAMES[burn],
    left: snap(particle.x) - PIXEL,
    top: snap(particle.y),
    colorOf,
    sway: Math.sin(particle.phase + particle.life * 0.6) > 0.3 ? PIXEL : 0,
  });
  context.globalAlpha = 1;
}

// branded white-hot, it cools to teal and fades, a flame flickering up off it the while
export function drawHoof(context, { x, y, life, maxLife, seed }) {
  const lit = maxLife - life < HOOF_FRESH ? ART.antlerTip : ART.hoof;
  const colors = { e: ART.edge, 1: lit, 2: ART.hoofRim };
  context.globalAlpha = Math.min(1, life / 12);
  const left = snap(x) - HOOF_HALF * PIXEL;
  drawPixels(context, {
    rows: HOOF,
    left,
    top: snap(y) - PIXEL * 2,
    colorOf: (key) => colors[key],
  });
  const height = (1 + Math.floor(flicker(seed, life >> 1) * 3)) * PIXEL;
  context.fillStyle = ART.flame[1];
  context.fillRect(left + (seed % 2 ? 2 : 7) * PIXEL, snap(y) - PIXEL * 2 - height, PIXEL, height);
  context.globalAlpha = 1;
}
