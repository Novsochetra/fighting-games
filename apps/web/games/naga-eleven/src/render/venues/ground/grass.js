import { bayer, grain2 } from '../kit/hash.js';

// a blade of grass is a two pixel stroke darker than its stripe, and now and then a pixel catches
// the light; the grain is fixed to the pixel of the drawing, which is fixed to the ground
export function grainOf(column, row) {
  if (grain2(column, row, 11) < 0.07 || grain2(column, row - 1, 11) < 0.07) {
    return -1;
  }

  return grain2(column, row, 12) < 0.045 ? 1 : 0;
}

export const toneIndex = (tone, column, row, ramp) =>
  Math.max(0, Math.min(ramp.length - 1, Math.floor(tone + bayer(column, row))));

// which stripe the mower left a world point in: bands across the pitch, or (`checks`) a chequer of
// bands both ways
export function stripeOf(x, y, { width, checks = false }) {
  const band = Math.floor(x / width);

  return checks ? (band + Math.floor(y / width)) & 1 : band & 1;
}

// grass in mown stripes on the pitch and plain round it; `light(x, y)` adds or takes away tone, for
// the shadow of a stand or the pools of the floodlights
export function mownGrass({ ramp, pitch, stripes, light = () => 0, rough = 0, surround = -0.3 }) {
  return (x, y, column, row) => {
    const onPitch = x >= 0 && x <= pitch.length && y >= 0 && y <= pitch.width;
    const base = (stripes.base ?? 2) + (onPitch ? stripeOf(x, y, stripes) : surround);
    const roughness = rough > 0 ? (grain2(column >> 2, row >> 1, 21) - 0.5) * rough : 0;

    return ramp[
      toneIndex(base + light(x, y) + grainOf(column, row) + roughness, column, row, ramp)
    ];
  };
}

// chalk: mostly bright, with a worn pixel here and there
export function chalk(ramp) {
  return (column, row) => (grain2(column, row, 31) < 0.12 ? ramp[0] : ramp[1]);
}
