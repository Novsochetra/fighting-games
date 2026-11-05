// As under a UIKit sheet: a pull past a third of the sheet, or a flick, dismisses it.
const DISMISS_SHARE = 1 / 3;
const FLICK_SPEED = 0.5;
const FLICK_MIN_OFFSET = 24;

export const dragOffset = (startY, y) => Math.max(0, y - startY);

export const pullOf = (offset, height) => (height > 0 ? Math.min(1, offset / height) : 0);

export function shouldDismiss({ offset, height, velocity }) {
  const isFlick = velocity > FLICK_SPEED && offset > FLICK_MIN_OFFSET;

  return isFlick || offset > height * DISMISS_SHARE;
}

// a sideways swipe belongs to a row inside the sheet, and one that starts scrolled down to its scroll
export function readIntent({ dx, dy, atTop }) {
  if (dx === 0 && dy === 0) {
    return 'undecided';
  }

  const isDown = dy > 0 && dy > Math.abs(dx);

  return atTop && isDown ? 'drag' : 'scroll';
}

export const isOutside = (rect, { clientX, clientY }) =>
  clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;

export function trackVelocity(last, y, time) {
  const elapsed = time - last.time;
  const velocity = elapsed > 0 ? (y - last.y) / elapsed : last.velocity;

  return { y, time, velocity };
}
