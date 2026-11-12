// Each level: prices move by `step` and stay under `max`; a price bought or shared `times` over
// stays under `unitMax`. Small round sums first, then the hundreds a market really asks for.
export const LEVELS = [
  { step: 100, max: 1000, times: [2, 3], unitMax: 500 },
  { step: 500, max: 5000, times: [2, 4], unitMax: 2000 },
  { step: 100, max: 5000, times: [2, 5], unitMax: 1200 },
  { step: 500, max: 10000, times: [2, 6], unitMax: 5000 },
  { step: 100, max: 10000, times: [2, 6], unitMax: 2500 },
  { step: 100, max: 20000, times: [2, 9], unitMax: 2000 },
  { step: 500, max: 50000, times: [2, 9], unitMax: 9500 },
  { step: 100, max: 50000, times: [2, 9], unitMax: 5000 },
  { step: 100, max: 100000, times: [2, 12], unitMax: 5000 },
  { step: 100, max: 100000, times: [2, 12], unitMax: 9900 },
];

export const levelSpec = (level) => LEVELS[Math.min(level, LEVELS.length) - 1];
