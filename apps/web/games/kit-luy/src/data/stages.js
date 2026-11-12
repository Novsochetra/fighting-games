const WHOLE_OR_HALF = [0, 5];
const WITH_SMALL_CHANGE = [0, 1, 2, 5, 6, 7];

// `from`: customers served when the stage opens. `mostPieces` and `hundreds` (the digits an
// answer's hundreds may be) keep every answer quick to count out of `pieces`. `least` to `most`
// bounds an answer, `priceStep` a price, `times` a ×, `shares` a ÷, and `paidWith` the piece a
// customer holds up for change, half the time `oftenPaid` where a stage names one.
export const STAGES = [
  {
    number: 1,
    from: 0,
    pay: 500,
    pieces: [500, 1000, 2000, 5000],
    mostPieces: 3,
    hundreds: WHOLE_OR_HALF,
    showTotal: true,
    least: 500,
    most: 8500,
    priceStep: 500,
    times: [2, 3],
    shares: [2, 3],
    paidWith: [1000, 2000, 5000, 10000],
    oftenPaid: null,
  },
  {
    number: 2,
    from: 8,
    pay: 1000,
    pieces: [500, 1000, 2000, 5000, 10000],
    mostPieces: 4,
    hundreds: WHOLE_OR_HALF,
    showTotal: true,
    least: 500,
    most: 20000,
    priceStep: 500,
    times: [2, 5],
    shares: [2, 4],
    paidWith: [1000, 2000, 5000, 10000, 20000],
    oftenPaid: null,
  },
  {
    number: 3,
    from: 18,
    pay: 1500,
    pieces: [100, 500, 1000, 2000, 5000, 10000, 20000],
    mostPieces: 5,
    hundreds: WITH_SMALL_CHANGE,
    showTotal: false,
    least: 100,
    most: 40000,
    priceStep: 100,
    times: [2, 6],
    shares: [2, 5],
    paidWith: [1000, 2000, 5000, 10000, 20000, 50000],
    oftenPaid: null,
  },
  {
    number: 4,
    from: 30,
    pay: 2000,
    pieces: [100, 500, 1000, 2000, 5000, 10000, 20000, 50000],
    mostPieces: 5,
    hundreds: WITH_SMALL_CHANGE,
    showTotal: false,
    least: 100,
    most: 90000,
    priceStep: 100,
    times: [2, 9],
    shares: [2, 6],
    paidWith: [1000, 2000, 5000, 10000, 20000, 50000],
    oftenPaid: 50000,
  },
  {
    number: 5,
    from: 44,
    pay: 2500,
    pieces: [100, 500, 1000, 2000, 5000, 10000, 20000, 50000],
    mostPieces: 5,
    hundreds: WITH_SMALL_CHANGE,
    showTotal: false,
    least: 100,
    most: 99500,
    priceStep: 100,
    times: [2, 12],
    shares: [2, 8],
    paidWith: [1000, 2000, 5000, 10000, 20000, 50000],
    oftenPaid: 50000,
  },
];

// one piece at every stage, so a draw that never passes still ends in a fair sum; the second is
// for when the first was asked just before
export const SURE_SUMS = {
  add: [
    { op: 'add', left: 500, right: 500, answer: 1000 },
    { op: 'add', left: 1000, right: 1000, answer: 2000 },
  ],
  sub: [
    { op: 'sub', left: 1000, right: 500, answer: 500 },
    { op: 'sub', left: 2000, right: 1000, answer: 1000 },
  ],
  mul: [
    { op: 'mul', left: 500, right: 2, answer: 1000 },
    { op: 'mul', left: 1000, right: 2, answer: 2000 },
  ],
  div: [
    { op: 'div', left: 1000, right: 2, answer: 500 },
    { op: 'div', left: 2000, right: 2, answer: 1000 },
  ],
};

export function stageOf(served) {
  const count = Number.isFinite(served) ? served : 0;
  const reached = STAGES.filter((stage) => stage.from <= count);

  return reached.length > 0 ? reached[reached.length - 1] : STAGES[0];
}
