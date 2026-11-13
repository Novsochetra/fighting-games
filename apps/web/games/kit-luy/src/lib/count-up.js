const FRAMES_TO_ARRIVE = 6;

export function countUp(shown, target, step) {
  if (shown >= target) {
    return target;
  }

  const stride = Math.ceil((target - shown) / FRAMES_TO_ARRIVE / step) * step;

  return Math.min(target, shown + stride);
}
