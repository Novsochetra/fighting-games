// fdlibm's __ieee754_rem_pio2 for |x| up to 2^19 * pi/2: x as a quadrant and a remainder, kept in
// two doubles (head and tail) so the remainder keeps its bits
const INV_HALF_PI = 6.36619772367581382433e-1;
const HALF_PI_1 = 1.57079632673412561417;
const HALF_PI_1_TAIL = 6.07710050650619224932e-11;
const HALF_PI_2 = 6.0771005063039659766e-11;
const HALF_PI_2_TAIL = 2.02226624879595063154e-21;
const HALF_PI_3 = 2.0222662487111664558e-21;
const HALF_PI_3_TAIL = 8.47842766036889956997e-32;
const THREE_QUARTER_PI = 0x4002d97c;
const MEDIUM_LIMIT = 0x413921fb;
const HALF_PI_HIGH = 0x3ff921fb;
// the high words of 1..32 times pi/2, where one step loses too many bits
const NEAR_HALF_PI_MULTIPLES = [
  0x3ff921fb, 0x400921fb, 0x4012d97c, 0x401921fb, 0x401f6a7a, 0x4022d97c, 0x4025fdbb, 0x402921fb,
  0x402c463a, 0x402f6a7a, 0x4031475c, 0x4032d97c, 0x40346b9c, 0x4035fdbb, 0x40378fdb, 0x403921fb,
  0x403ab41b, 0x403c463a, 0x403dd85a, 0x403f6a7a, 0x40407e4c, 0x4041475c, 0x4042106c, 0x4042d97c,
  0x4043a28c, 0x40446b9c, 0x404534ac, 0x4045fdbb, 0x4046c6cb, 0x40478fdb, 0x404858eb, 0x404921fb,
];

const words = new DataView(new ArrayBuffer(8));

export function highWord(value) {
  words.setFloat64(0, value);
  return words.getInt32(0);
}

export function fromWords(high, low) {
  words.setInt32(0, high);
  words.setInt32(4, low);
  return words.getFloat64(0);
}

const exponentOf = (value) => (highWord(value) >> 20) & 0x7ff;

function reduceNearHalfPi(x, absHigh, reduced) {
  const sign = x > 0 ? 1 : -1;
  let rest = x - sign * HALF_PI_1;
  let tail = HALF_PI_1_TAIL;
  if (absHigh === HALF_PI_HIGH) {
    rest -= sign * HALF_PI_2;
    tail = HALF_PI_2_TAIL;
  }
  reduced[0] = rest - sign * tail;
  reduced[1] = rest - reduced[0] - sign * tail;
  return sign;
}

function takeNextPiece(step, quadrants, piece, pieceTail) {
  const before = step.rest;
  const cut = quadrants * piece;
  step.rest = before - cut;
  step.error = quadrants * pieceTail - (before - step.rest - cut);
  step.head = step.rest - step.error;
}

function reduceMedium(x, absHigh, reduced) {
  const size = Math.abs(x);
  const quadrants = Math.trunc(size * INV_HALF_PI + 0.5);
  const rest = size - quadrants * HALF_PI_1;
  const error = quadrants * HALF_PI_1_TAIL;
  const step = { rest, error, head: rest - error };
  const lostBits = () => (absHigh >> 20) - exponentOf(step.head);
  const nearMultiple = quadrants >= 32 || absHigh === NEAR_HALF_PI_MULTIPLES[quadrants - 1];
  if (nearMultiple && lostBits() > 16) {
    takeNextPiece(step, quadrants, HALF_PI_2, HALF_PI_2_TAIL);
    if (lostBits() > 49) {
      takeNextPiece(step, quadrants, HALF_PI_3, HALF_PI_3_TAIL);
    }
  }
  const sign = x < 0 ? -1 : 1;
  reduced[0] = sign * step.head;
  reduced[1] = sign * (step.rest - step.head - step.error);
  return sign * quadrants;
}

// for pi/4 < |x|; null past 2^19 * pi/2, where fdlibm switches to a long table of 2/pi bits
export function reduceByHalfPi(x, reduced) {
  const absHigh = highWord(x) & 0x7fffffff;
  if (absHigh < THREE_QUARTER_PI) {
    return reduceNearHalfPi(x, absHigh, reduced);
  }
  if (absHigh <= MEDIUM_LIMIT) {
    return reduceMedium(x, absHigh, reduced);
  }
  return null;
}
