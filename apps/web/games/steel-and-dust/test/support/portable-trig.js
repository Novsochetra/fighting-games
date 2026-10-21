import { fromWords, highWord, reduceByHalfPi } from './portable-trig-reduce.js';

// Math.sin and Math.cos are fdlibm built into V8, and on arm64 (Apple Silicon) about one result in
// 200 rounds its last bit to the other side from x64, where the fixtures were recorded and CI runs.
// This is the same fdlibm, step for step in plain doubles, so it gives x64's bits on every CPU.
const SIN_TERMS = [
  -1.66666666666666324348e-1, 8.33333333332248946124e-3, -1.98412698298579493134e-4,
  2.75573137070700676789e-6, -2.50507602534068634195e-8, 1.58969099521155010221e-10,
];
const COS_TERMS = [
  4.16666666666666019037e-2, -1.38888888888741095749e-3, 2.48015872894767294178e-5,
  -2.75573143513906633035e-7, 2.0875723212981748279e-9, -1.13596475577881948265e-11,
];
const TINY = 0x3e400000;
const QUARTER_PI = 0x3fe921fb;
const NEAR_ZERO_POINT_THREE = 0x3fd33333;
const NEAR_ZERO_POINT_78 = 0x3fe90000;
const NOT_FINITE = 0x7ff00000;
const nativeSin = Math.sin;
const nativeCos = Math.cos;
const reduced = [0, 0];

function sinKernel(x, tail, wasReduced) {
  if ((highWord(x) & 0x7fffffff) < TINY) {
    return x;
  }
  const [s1, s2, s3, s4, s5, s6] = SIN_TERMS;
  const square = x * x;
  const cube = square * x;
  const series = s2 + square * (s3 + square * (s4 + square * (s5 + square * s6)));
  if (!wasReduced) {
    return x + cube * (s1 + square * series);
  }
  return x - (square * (0.5 * tail - cube * series) - tail - cube * s1);
}

function cosKernel(x, tail) {
  const absHigh = highWord(x) & 0x7fffffff;
  if (absHigh < TINY) {
    return 1;
  }
  const [c1, c2, c3, c4, c5, c6] = COS_TERMS;
  const square = x * x;
  const series =
    square * (c1 + square * (c2 + square * (c3 + square * (c4 + square * (c5 + square * c6)))));
  if (absHigh < NEAR_ZERO_POINT_THREE) {
    return 1 - (0.5 * square - (square * series - x * tail));
  }
  const quarter = absHigh > NEAR_ZERO_POINT_78 ? 0.28125 : fromWords(absHigh - 0x00200000, 0);
  return 1 - quarter - (0.5 * square - quarter - (square * series - x * tail));
}

const SIN_BY_QUADRANT = [
  (head, tail) => sinKernel(head, tail, true),
  (head, tail) => cosKernel(head, tail),
  (head, tail) => -sinKernel(head, tail, true),
  (head, tail) => -cosKernel(head, tail),
];

function portable(x, quarterTurns, native) {
  const absHigh = highWord(x) & 0x7fffffff;
  if (absHigh <= QUARTER_PI) {
    return quarterTurns ? cosKernel(x, 0) : sinKernel(x, 0, false);
  }
  if (absHigh >= NOT_FINITE) {
    return x - x;
  }
  const quadrant = reduceByHalfPi(x, reduced);
  // the game only goes past 2^19 * pi/2 for wind sway rounded to whole pixels, where a last bit
  // never shows
  if (quadrant === null) {
    return native(x);
  }
  return SIN_BY_QUADRANT[(quadrant + quarterTurns) & 3](reduced[0], reduced[1]);
}

export const portableSin = (x) => portable(x, 0, nativeSin);

export const portableCos = (x) => portable(x, 1, nativeCos);
