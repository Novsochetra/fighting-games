// a ramp's shades under the letters a pixel map paints them with, dark to light; letters fewer than
// the ramp's shades take shades spread along it, as the footballer sheets are recoloured
export const shadeKeys = (ramp, keys) =>
  Object.fromEntries(
    [...keys].map((key, i) => [
      key,
      ramp[Math.round((i * (ramp.length - 1)) / Math.max(1, keys.length - 1))],
    ]),
  );
