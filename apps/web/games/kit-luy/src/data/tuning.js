export const TUNING = {
  seats: 5,
  firstArrivalMs: 8000,
  arrivalDropMs: 150,
  // at 2,600 a player who pays inside two seconds is never caught and the stall never closes
  minArrivalMs: 1500,
  wrongLockMs: 600,
  clothMost: 12,
  cleanPay: 500,
  // a payment's share of the patience left decides its speed, and the speed how many times the
  // stage's pay it adds
  speedShares: { perfect: 0.6, great: 0.3 },
  speedTimes: { perfect: 2, great: 1, good: 0 },
  // customers who may storm off unpaid in a day: the next one closes the stall
  trust: 3,
  mostTyped: 6,
  streakPerExtra: 5,
  extraPay: 1000,
  mostExtraPay: 5000,
  // the title screen's lesson: put 1,000 on the cloth and give it
  firstSum: { op: 'add', left: 500, right: 500, answer: 1000 },
  drawTries: 40,
  oftenPaidChance: 0.5,
  missedShown: 3,
};
