export const TUNING = {
  seats: 5,
  firstArrivalMs: 8000,
  arrivalDropMs: 150,
  // at 2,600 a player who pays inside two seconds is never caught and the stall never closes
  minArrivalMs: 1500,
  wrongLockMs: 600,
  clothMost: 12,
  cleanPay: 500,
  tipPay: 500,
  streakPerExtra: 5,
  extraPay: 1000,
  mostExtraPay: 5000,
  // the title screen's lesson: put 1,000 on the cloth and give it
  firstSum: { op: 'add', left: 500, right: 500, answer: 1000 },
  drawTries: 40,
  oftenPaidChance: 0.5,
  missedShown: 3,
};
