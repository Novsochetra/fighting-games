// a critically damped spring, stepped one tick at a time: it closes on a moving target as fast as
// it can without overshooting, so the view never wobbles past the ball and back
// (Game Programming Gems 4, "Critically Damped Ease-In/Ease-Out Smoothing")
export function smoothStep(axis, target, smoothTicks) {
  const omega = 2 / smoothTicks;
  const decay = 1 / (1 + omega + 0.48 * omega * omega + 0.235 * omega * omega * omega);
  const change = axis.value - target;
  const push = axis.velocity + omega * change;

  axis.velocity = (axis.velocity - omega * push) * decay;
  axis.value = target + (change + push) * decay;
}

export const easeInOut = (share) => share * share * (3 - 2 * share);
