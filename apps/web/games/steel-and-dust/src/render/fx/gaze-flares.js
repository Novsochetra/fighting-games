import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { PIXEL, ellipseRows, fillRows, fineRect, flicker, inLight, snap } from './fine-pixels.js';
import { drawHalo, drawStar } from './light-star.js';

// the star in his eyes throbs between these arm lengths (screen pixels), flares as the pillar bursts
// and shrinks as the ray dies
const EYE_ARMS = [4, 6, 5, 8];
const BURST_ARM = 13;
const DYING_ARM = 3;
// the light splashing along the road where the ray lands, half its width in world pixels
const SPLASH = [3, 4, 5];

export function eyeArm(time) {
  if (time >= 2) {
    return DYING_ARM;
  }
  return time >= 0 ? BURST_ARM : EYE_ARMS[(time >> 1) & 3];
}

// his eyes flare where the ray leaves them
export function drawEyeFlare(context, { eyes, time }) {
  const arm = eyeArm(time);
  drawHalo(context, { ...eyes, radius: 1 + arm * 0.15 });
  drawStar(context, { ...eyes, arm });
}

// where the ray lands, its light splashes flat along the road and sprays up off it
export function drawImpactFlare(context, { x, y, time }) {
  const beat = time >> 1;
  const seed = Math.round(x);
  const splash = SPLASH[Math.floor(flicker(seed, beat) * SPLASH.length)];
  inLight(context, () => {
    context.globalAlpha = 0.35;
    context.fillStyle = FX_COLORS.gazeEmber;
    fillRows(context, { x, y, rows: ellipseRows(splash + 4, 2) });
    context.globalAlpha = 0.5;
    context.fillStyle = FX_COLORS.gazeGold;
    fillRows(context, { x, y: y - PIXEL, rows: ellipseRows(splash + 1, 1) });
  });
  context.globalAlpha = 1;
  context.fillStyle = FX_COLORS.gazeGold;
  fineRect(context, {
    x: x - splash - 1.5,
    y: y - PIXEL,
    width: (splash + 1.5) * 2,
    height: PIXEL,
  });
  context.fillStyle = COLORS.white;
  fineRect(context, { x: x - splash, y: y - PIXEL, width: splash * 2, height: PIXEL });
  for (let i = -1; i <= 1; i++) {
    const height = snap(1 + flicker(seed + i, beat) * 3);
    context.fillStyle = FX_COLORS.gazeWhite;
    fineRect(context, { x: x + i * 2.5, y: y - PIXEL - height, width: PIXEL, height });
    context.fillStyle = FX_COLORS.gazeGold;
    fineRect(context, { x: x + i * 2.5, y: y - PIXEL * 2 - height, width: PIXEL, height: PIXEL });
  }
}
