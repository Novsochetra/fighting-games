const DURATION_PATTERN = /^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/;

export function parseDuration(value) {
  const match = DURATION_PATTERN.exec(String(value ?? '').trim());
  if (!match) {
    return 0;
  }
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

export function readToken(document, name) {
  const style = document.defaultView.getComputedStyle(document.documentElement);
  return style.getPropertyValue(name).trim();
}

export const readDuration = (document, name) => parseDuration(readToken(document, name));

// Script-driven motion reads its timing from the home page's tokens like the CSS does; without them it
// does not animate.
export function readTiming(document, { duration, easing }) {
  return {
    duration: readDuration(document, duration),
    easing: readToken(document, easing) || 'linear',
  };
}

export const readLaunchTiming = (document) =>
  readTiming(document, { duration: '--duration-launch', easing: '--easing-launch' });

export function prefersReducedMotion(window) {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

// Plays keyframes when the visitor allows motion and the tokens give them a length.
export function animateWith(element, keyframes, timing) {
  const window = element.ownerDocument.defaultView;
  if (timing.duration <= 0 || prefersReducedMotion(window) || !element.animate) {
    return null;
  }
  return element.animate(keyframes, timing);
}
