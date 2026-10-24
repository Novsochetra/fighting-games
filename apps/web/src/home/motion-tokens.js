const DURATION_PATTERN = /^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/;

export function parseDuration(value) {
  const match = DURATION_PATTERN.exec(String(value ?? '').trim());
  if (!match) {
    return 0;
  }
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

// The launch reads its timing from the home page's tokens like the CSS does; without them it does not
// animate.
export function readLaunchTiming(document) {
  const style = document.defaultView.getComputedStyle(document.documentElement);
  return {
    duration: parseDuration(style.getPropertyValue('--duration-launch')),
    easing: style.getPropertyValue('--easing-launch').trim() || 'linear',
  };
}

export function prefersReducedMotion(window) {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}
